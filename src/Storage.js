const {
  cloneDeep, merge, clone, difference, each, xor, includes,
} = require('lodash');
const { Networks } = require('@dashevo/dashcore-lib');
const EVENTS = require('./EVENTS');
const { is, hasProp, dashToDuffs } = require('./utils');
const {
  TransactionNotInStore, InvalidAddressObject, InvalidTransaction, InvalidUTXO,
} = require('./errors');

const defaultOpts = {
  rehydrate: true,
  autosave: true,
};

const initialStore = {
  wallets: {},
  transactions: {},
  chains: {},
};
const mergeHelper = (initial = {}, additional = {}) => merge(initial, additional);
/**
 * Handle all the storage logic, it's a wrapper around the adapters
 * So all the needed methods should be provided by the Storage class and the access to the adapter
 * should be limited.
 * */
class Storage {
  constructor(opts = defaultOpts) {
    this.adapter = opts.adapter;

    this.events = opts.events;
    this.store = cloneDeep(initialStore);
    this.rehydrate = (opts.rehydrate) ? opts.rehydrate : defaultOpts.rehydrate;
    this.autosave = (opts.autosave) ? opts.autosave : defaultOpts.autosave;
    this.lastRehydrate = null;
    this.lastSave = null;
    this.lastModified = null;

    if (opts.walletId) {
      this.createWallet(opts.walletId, opts.network, opts.mnemonic, opts.type);
    }
    this.interval = setInterval(() => {
      if (this.lastModified > this.lastSave) {
        this.saveState();
      }
    }, 10 * 1000);

    // Map an address to it's walletid/path/type schema (used by searchAddress for speedup)
    this.mappedAddress = {};

    setTimeout(() => {
      this.init();
    }, 1);
  }

  attachEvents(events) {
    this.events = events;
  }

  /**
   * Allow to clear the working interval (worker).
   * @return {boolean}
   */
  stopWorker() {
    clearInterval(this.interval);
    this.interval = null;
    return true;
  }

  /**
   * Return the content of the store
   * @return {{} & any}
   */
  getStore() {
    return cloneDeep(this.store);
  }

  async init() {
    await this.rehydrateState();
  }

  createChain(network) {
    if (!hasProp(this.store.chains, network.toString())) {
      this.store.chains[network.toString()] = {
        name: network.toString(),
        blockheight: -1,
      };
      return true;
    }
    return false;
  }

  createWallet(walletId, network = Networks.testnet, mnemonic = null, type = null) {
    if (!hasProp(this.store.wallets, walletId)) {
      this.store.wallets[walletId] = {
        accounts: {},
        network,
        mnemonic,
        type,
        blockheight: 0,
        addresses: {
          external: {},
          internal: {},
          misc: {},
        },
      };
      this.createChain(network);
      return true;
    }
    return false;
  }

  /**
   * Fetch the state from the persistance adapter
   * @return {Promise<void>}
   */
  async rehydrateState() {
    if (this.rehydrate && this.lastRehydrate === null) {
      try {
        const transactions = (this.adapter && hasProp(this.adapter, 'getItem'))
          ? (await this.adapter.getItem('transactions') || this.store.transactions)
          : this.store.transactions;
        const wallets = (this.adapter && hasProp(this.adapter, 'getItem'))
          ? (await this.adapter.getItem('wallets') || this.store.wallets)
          : this.store.wallets;

        this.store.transactions = mergeHelper(this.store.transactions, transactions);
        this.store.wallets = mergeHelper(this.store.wallets, wallets);
        this.lastRehydrate = +new Date();
      } catch (e) {
        console.log('Storage rehydrateState err', e);
        throw e;
      }
    }
    await this.saveState();
  }

  /**
   * Force persistance of the state to the adapter
   * @return {Promise<boolean>}
   */
  async saveState() {
    if (this.autosave && this.adapter && this.adapter.setItem) {
      const self = this;
      try {
        await this.adapter.setItem('transactions', { ...self.store.transactions });
        await this.adapter.setItem('wallets', { ...self.store.wallets });
        this.lastSave = +new Date();

        return true;
      } catch (e) {
        console.log('Storage saveState err', e);
        throw e;
      }
    }
    return false;
  }

  getTransaction(txid) {
    const { transactions } = this.store;
    if (!transactions[txid]) throw new TransactionNotInStore(txid);
    return this.store.transactions[txid];
  }

  addUTXOToAddress(utxo, address) {
    if (!is.address(address)) throw new Error('Invalid address');
    if (is.arr(utxo)) {
      utxo.forEach((_utxo) => {
        this.addUTXOToAddress(_utxo, address);
      });
      return false;
    }
    if (!is.utxo(utxo)) throw new InvalidUTXO(utxo);
    const searchAddr = this.searchAddress(address);

    if (searchAddr.found) {
      const newAddr = cloneDeep(searchAddr.result);
      if (!newAddr.transactions.includes(utxo.txid)) {
        newAddr.transactions.push(utxo.txid);
      }
      // If the received utxo does not exist
      if (!!newAddr.utxos[utxo.txid] === false) {
        newAddr.utxos[utxo.txid] = utxo;
        newAddr.used = true;
        this.updateAddress(newAddr, searchAddr.walletId);
      }
    }
  }

  importTransaction(transaction) {
    const self = this;
    if (!is.transaction(transaction)) throw new InvalidTransaction(transaction);
    const transactionStore = this.store.transactions;
    const transactionsIds = Object.keys(transactionStore);

    if (!transactionsIds.includes[transaction.txid]) {
      // eslint-disable-next-line no-param-reassign
      transactionStore[transaction.txid] = transaction;

      // We should now also check if it concern one of our address

      // VIN
      const vins = transaction.vin;
      vins.forEach((vin) => {
        const search = self.searchAddress(vin.addr);
        if (search.found) {
          const newAddr = cloneDeep(search.result);
          if (!newAddr.transactions.includes(transaction.txid)) {
            newAddr.transactions.push(transaction.txid);
            newAddr.used = true;
            self.updateAddress(newAddr, search.walletId);
          }
        }
      });

      // VOUT
      const vouts = transaction.vout;
      vouts.forEach((vout) => {

        vout.scriptPubKey.addresses.forEach((addr) => {
          const search = self.searchAddress(addr);
          if (search.found) {
            const isSpent = !!vout.spentTxId;
            if (!isSpent) {
              const utxo = {
                txid: transaction.txid,
                outputIndex: vout.n,
                satoshis: dashToDuffs(parseFloat(vout.value)),
                scriptPubKey: vout.scriptPubKey.hex,
              };
              self.addUTXOToAddress(utxo, search.result.address);
            }
          }
        });
      });
      this.lastModified = +new Date();
    } else {
      throw new Error('Tx already exist');
    }
  }

  /**
   * Import an array of transactions or a transaction object to the store
   * @param transactions
   * @return {boolean}
   * */
  importTransactions(transactions) {
    const type = transactions.constructor.name;
    const self = this;

    if (type === 'Object') {
      if (transactions.txid) {
        const transaction = transactions;
        self.importTransaction(transaction);
      } else {
        const transactionsIds = Object.keys(transactions);
        if (transactionsIds.length === 0) {
          throw new Error('Invalid transaction');
        }
        transactionsIds.forEach((id) => {
          const transaction = transactions[id];
          self.importTransaction(transaction);
        });
      }
    } else if (type === 'Array') {
      throw new Error('Not implemented. Please create an issue on github if needed.');
    } else {
      throw new Error('Invalid transaction. Cannot import.');
    }
    return true;
  }

  /**
   * Import an array of accounts or a account object to the store
   * @param accounts
   * @param walletId
   * @return {boolean}
   */
  importAccounts(accounts, walletId) {
    const type = accounts.constructor.name;
    if (!walletId) throw new Error('Expected walletId to import addresses');
    if (!this.searchWallet(walletId).found) {
      this.createWallet(walletId);
    }
    const accList = this.store.wallets[walletId].accounts;

    if (type === 'Object') {
      if (accounts.path) {
        if (!accList[accounts.path]) {
          accList[accounts.path] = accounts;
          this.lastModified = +new Date();
        }
      } else {
        const accountsPaths = Object.keys(accounts);
        accountsPaths.forEach((path) => {
          const el = accounts[path];
          if (el.path) {
            if (!accList[el.path]) {
              accList[el.path] = el;
              this.lastModified = +new Date();
            }
          }
        });
      }
    } else if (type === 'Array') {
      throw new Error('Not implemented. Please create an issue on github if needed.');
    } else {
      throw new Error('Invalid account. Cannot import.');
    }
    return true;
  }

  importSingleAddress(singleAddress, walletId) {
    const type = singleAddress.constructor.name;
    if (!walletId) throw new Error('Expected walletId to import single address');
    if (!this.searchWallet(walletId).found) {
      this.createWallet(walletId);
    }
    const accList = this.store.wallets[walletId].accounts;

    if (type === 'Object') {
      if (singleAddress.path) {
        accList[singleAddress.path] = (singleAddress);
        this.lastModified = +new Date();
      }
    } else if (type === 'Array') {
      throw new Error('Not implemented. Please create an issue on github if needed.');
    } else {
      throw new Error('Invalid account. Cannot import.');
    }
    return true;
  }

  /**
   * Update a specific address information in the store
   * @param addressObj
   * @param walletId
   * @return {boolean}
   */
  updateAddress(addressObj, walletId) {
    if (!walletId) throw new Error('Expected walletId to update an address');
    if (!is.addressObj(addressObj)) throw new InvalidAddressObject(addressObj);
    const { path } = addressObj;
    if (!path) throw new Error('Expected path to update an address');
    const typeInt = path.split('/')[4];
    let type;
    switch (typeInt) {
      case '0':
        type = 'external';
        break;
      case '1':
        type = 'internal';
        break;
      default:
        type = 'misc';
    }
    const walletStore = this.store.wallets[walletId];
    const addressesStore = walletStore.addresses;
    const previousObject = cloneDeep(addressesStore[type][path]);

    const newObject = cloneDeep(addressObj);
    // We do not autorize to alter UTXO using this
    // if(newObject.utxos.length==0 && previousObject.utxos.length>0){
    //
    // }

    const currentBlockHeight = this.store.chains[walletStore.network.toString()].blockheight;

    // We calculate here the balanceSat and unconfirmedBalanceSat of our addressObj
    // We do that to avoid getBalance to be slow, so we have to keep that in mind or then
    // Move that to an event type of calculation or somth
    let { balanceSat, unconfirmedBalanceSat } = newObject;
    const { utxos } = newObject;

    const newObjectUtxosKeys = Object.keys(utxos);
    if (newObjectUtxosKeys.length > 0) {
      // we compare the diff between the two utxos sets

      const newUtxos = xor(newObjectUtxosKeys, Object.keys(previousObject.utxos));
      newUtxos.forEach((txid) => {
        const utxo = utxos[txid];
        try {
          const { blockheight } = this.getTransaction(utxo.txid);
          if (currentBlockHeight - blockheight >= 6) balanceSat += utxo.satoshis;
          else unconfirmedBalanceSat += utxo.satoshis;
        } catch (e) {
          // console.log(e);
          if (e instanceof TransactionNotInStore) {
            // TODO : We consider unconfirmed a transaction that we don't know of, should we ?
            unconfirmedBalanceSat += utxo.satoshis;
          } else throw e;
        }
      });
    }

    if (previousObject === undefined) {
      if (newObject.balanceSat > 0) {
        this.announce(
          EVENTS.BALANCE_CHANGED,
          {
            currentValue: newObject.balanceSat,
            delta: newObject.balanceSat,
          },
        );
      }
      if (newObject.unconfirmedBalanceSat > 0) {
        this.announce(
          EVENTS.UNCONFIRMED_BALANCE_CHANGED,
          { currentValue: newObject.unconfirmedBalanceSat, delta: newObject.unconfirmedBalanceSat },
        );
      }
    } else {
      if (previousObject.balanceSat !== newObject.balanceSat) {
        this.announce(
          EVENTS.BALANCE_CHANGED,
          {
            delta: newObject.balanceSat - previousObject.balanceSat,
            currentValue: newObject.balanceSat,
          },
        );
      }
      if (previousObject.unconfirmedBalanceSat !== newObject.unconfirmedBalanceSat) {
        this.announce(EVENTS.UNCONFIRMED_BALANCE_CHANGED,
          {
            delta: newObject.unconfirmedBalanceSat - previousObject.unconfirmedBalanceSat,
            currentValue: newObject.unconfirmedBalanceSat,
          });
      }
    }

    // Check if there is a balance but no utxo.
    addressesStore[type][path] = newObject;
    this.lastModified = Date.now();

    if (!this.mappedAddress[newObject.address]) this.mappedAddress[newObject.address] = { walletId, type, path };
    return true;
  }

  /**
   * Update a specific transaction information in the store
   * It do not handle any merging right now and write over previous data.
   * @param address
   * @param walletId
   * @return {boolean}
   */
  updateTransaction(transaction) {
    if (!transaction) throw new Error('Expected a transaction to update');

    const transactionStore = this.store.transactions;
    transactionStore[transaction.txid] = transaction;
    this.lastModified = Date.now();
    return true;
  }


  /**
   * Search a specific address in the store
   * @param address
   * @param forceLoop - boolean - default : false - When set at true, for a search instead of using map
   * @return {{address: *, type: null, found: boolean}}
   */
  searchAddress(address, forceLoop = false) {
    const search = {
      address,
      type: null,
      found: false,
    };
    const { store } = this;
    if (forceLoop === true) {
      // Look up by looping over all addresses todo:optimisation
      const existingWallets = Object.keys(store.wallets);
      existingWallets.forEach((walletId) => {
        const existingTypes = Object.keys(store.wallets[walletId].addresses);
        existingTypes.forEach((type) => {
          const existingPaths = Object.keys(store.wallets[walletId].addresses[type]);
          existingPaths.forEach((path) => {
            const el = store.wallets[walletId].addresses[type][path];
            if (el.address === search.address) {
              search.path = path;
              search.type = type;
              search.found = true;
              search.result = el;
              search.walletId = walletId;
            }
          });
        });
      });
    } else if (this.mappedAddress[address]) {
      const { path, type, walletId } = this.mappedAddress[address];
      const el = store.wallets[walletId].addresses[type][path];

      search.path = path;
      search.type = type;
      search.found = true;
      search.result = el;
      search.walletId = walletId;
    }


    return search;
  }

  searchWallet(walletId) {
    const search = {
      walletId,
      found: false,
    };
    const store = this.getStore();
    if (store.wallets[walletId]) {
      search.found = true;
      search.result = store.wallets[walletId];
    }
    return search;
  }

  /**
   * Search a specific txid in the store
   * @param txid
   * @return {{txid: *, found: boolean}}
   */
  searchTransaction(txid) {
    const search = {
      txid,
      found: false,
    };
    const store = this.getStore();
    if (store.transactions[txid]) {
      const tx = store.transactions[txid];
      if (tx.txid === txid) {
        search.found = true;
        search.result = tx;
      }
    }
    return search;
  }

  /**
   * Search an address having a specific txid
   * todo : Handle when multiples one (inbound/outbound)
   * @param txid
   * @return {{txid: *, address: null, type: null, found: boolean}}
   */
  searchAddressWithTx(txid) {
    const search = {
      txid,
      address: null,
      type: null,
      found: false,
    };
    const store = this.getStore();

    // Look up by looping over all addresses todo:optimisation
    const existingWallets = Object.keys(store);
    existingWallets.forEach((walletId) => {
      const existingTypes = Object.keys(store.wallets[walletId].addresses);
      existingTypes.forEach((type) => {
        const existingPaths = Object.keys(store.wallets[walletId].addresses[type]);
        existingPaths.forEach((path) => {
          const el = store.wallets[walletId].addresses[type][path];
          if (el.transactions.includes(search.txid)) {
            search.path = path;
            search.address = el.address;
            search.type = type;
            search.found = true;
            search.result = el;
          }
        });
      });
    });

    return search;
  }

  /**
   * Add a new transaction to an address (push a tx)
   * @param tx
   * @return {boolean}
   */
  addNewTxToAddress(tx, walletId) {
    if (tx.address && tx.txid) {
      const { type, path, found } = this.searchAddress(tx.address);
      if (!found) {
        console.log('Search was not successfull');
        return false;
      }
      this.store.wallets[walletId].addresses[type][path].transactions.push(tx.txid);
      // Because of the unclear state will force a refresh
      this.store.wallets[walletId].addresses[type][path].fetchedLast = 0;
      this.lastModified = +new Date();
      return true;
    }
    throw new Error('Invalid tx to add : tx');
  }

  /**
   * Import one address to the store
   * @param addressObj
   * @param walletId
   * @return {boolean}
   */
  importAddress(addressObj, walletId) {
    if (!walletId) throw new Error('Expected walletId to import addresses');
    if (!this.searchWallet(walletId).found) {
      this.createWallet(walletId);
    }
    const addressesStore = this.store.wallets[walletId].addresses;
    if (is.undef(walletId)) throw new Error('Expected walletId to import an address');
    if (!is.addressObj(addressObj)) throw new InvalidAddressObject(addressObj);
    const { path } = addressObj;
    const modifiedAddressObject = cloneDeep(addressObj);
    const index = parseInt(path.split('/')[5], 10);
    const typeInt = path.split('/')[4];
    let type;
    switch (typeInt) {
      case '0':
        type = 'external';
        break;
      case '1':
        type = 'internal';
        break;
      default:
        type = 'misc';
    }
    if (!walletId) throw new Error('Invalid walletId. Cannot import');
    if (!modifiedAddressObject.index) modifiedAddressObject.index = index;
    if (addressesStore[type][path]) {
      if (addressesStore[type][path].fetchedLast < modifiedAddressObject.fetchedLast) {
        this.updateAddress(modifiedAddressObject, walletId);
      }
    } else {
      this.updateAddress(modifiedAddressObject, walletId);
    }
    return true;
  }

  /**
   * Import one or multiple addresses to the store
   * @param addresses
   * @param walletId
   * @return {boolean}
   */
  importAddresses(addresses, walletId) {
    if (!walletId) throw new Error('Expected walletId to import addresses');
    if (!this.searchWallet(walletId).found) {
      this.createWallet(walletId);
    }
    const type = addresses.constructor.name;
    if (type === 'Object') {
      if (addresses.path) {
        const address = addresses;
        this.importAddress(address, walletId);
      } else {
        const addressPaths = Object.keys(addresses);
        addressPaths.forEach((path) => {
          const address = addresses[path];
          this.importAddress(address, walletId);
        });
      }
    } else if (type === 'Array') {
      throw new Error('Not implemented. Please create an issue on github if needed.');
    } else {
      throw new Error('Not implemented. Please create an issue on github if needed.');
    }
    return true;
  }

  announce(type, el) {
    if (!this.events) return false;
    switch (type) {
      case EVENTS.BALANCE_CHANGED:
      case EVENTS.UNCONFIRMED_BALANCE_CHANGED:
        this.events.emit(type, el);
        break;
      default:
        this.events.emit(type, el);
        console.warn('Not implemented, announce of ', type, el);
    }
    return true;
  }

  /**
   * Clear all the store and save the cleared store to the persistance adapter
   * @return {Promise<boolean>}
   */
  async clearAll() {
    this.store = cloneDeep(initialStore);
    return this.saveState();
  }
}

module.exports = Storage;
