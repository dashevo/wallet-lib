const { cloneDeep } = require('lodash');
const { is, hasProp } = require('./utils');
const _ = require('lodash');

const defaultOpts = {

};

const initialStore = {
  wallets: {},
  transactions: {},
};
const mergeHelper = function (initial = {}, additionnal = {}) {
  return _.merge(initial, additionnal);
};
/**
 * Handle all the storage logic, it's a wrapper around the adapters
 * So all the needed methods should be provided by the Storage class and the access to the adapter
 * should be limited.
 */
class Storage {
  constructor(opts = defaultOpts) {
    this.adapter = opts.adapter;

    this.store = cloneDeep(initialStore);
    this.lastRehydrate = null;
    this.lastSave = null;
    this.lastModified = null;

    if (opts.walletId) {
      this.createWallet(opts.walletId);
    }
    this.interval = setInterval(() => {
      if (this.lastModified > this.lastSave) {
        this.saveState();
      }
    }, 30 * 1000);

    setTimeout(() => {
      this.init();
    }, 1);
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
    return Object.assign({}, this.store);
  }

  async init() {
    await this.rehydrateState();
  }

  createWallet(walletId) {
    if (!hasProp(this.store.wallets, walletId)) {
      this.store.wallets[walletId] = {
        accounts: {},
        network: undefined,
        addresses: {
          external: {},
          internal: {},
          misc: {},
        },
      };
      return true;
    }
    return false;
  }

  /**
   * Fetch the state from the persistance adapter
   * @return {Promise<void>}
   */
  async rehydrateState() {
    const transactions = (this.adapter) ? (await this.adapter.getItem('transactions') || this.store.transactions) : this.store.transactions;
    const wallets = (this.adapter) ? (await this.adapter.getItem('wallets') || this.store.wallets) : this.store.wallets;

    this.store.transactions = mergeHelper(this.store.transactions, transactions);
    this.store.wallets = mergeHelper(this.store.wallets, wallets);
    this.lastRehydrate = +new Date();
  }

  /**
   * Force persistance of the state to the adapter
   * @return {Promise<boolean>}
   */
  async saveState() {
    const self = this;
    await this.adapter.setItem('transactions', { ...self.store.transactions });
    await this.adapter.setItem('wallets', { ...self.store.wallets });
    this.lastSave = +new Date();
    return true;
  }

  /**
   * Import an array of transactions or a transaction object to the store
   * @param transactions
   * @return {boolean}
   */
  importTransactions(transactions) {
    const type = transactions.constructor.name;
    const txList = this.store.transactions;

    if (type === 'Object') {
      if (transactions.txid) {
        if (!txList[transactions.txid]) {
          if (!is.transaction(transactions)) {
            throw new Error('Can\'t import this transaction. Invalid structure.');
          }
          txList[transactions.txid] = transactions;
          this.lastModified = +new Date();
        }
      } else {
        const transactionsIds = Object.keys(transactions);
        transactionsIds.forEach((id) => {
          const el = transactions[id];
          if (el.txid) {
            if (!txList[el.txid]) {
              if (!is.transaction(el)) {
                throw new Error('Can\'t import this transaction. Invalid structure.');
              }
              txList[el.txid] = el;
              this.lastModified = +new Date();
            }
          }
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

  /**
   * Update a specific address information in the store
   * It do not handle any merging right now and write over previous data.
   * @param address
   * @param walletId
   * @return {boolean}
   */
  updateAddress(address, walletId) {
    if (!walletId) throw new Error('Expected walletId to update an address');
    const { path } = address;
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
    const addressesStore = this.store.wallets[walletId].addresses;
    addressesStore[type][path] = address;
    this.lastModified = Date.now();
    return true;
  }

  /**
   * Search a specific address in the store
   * @param address
   * @return {{address: *, type: null, found: boolean}}
   */
  searchAddress(address) {
    const search = {
      address,
      type: null,
      found: false,
    };
    const store = this.getStore();

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
          }
        });
      });
    });

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
    const existingTypes = Object.keys(store.addresses);
    existingTypes.forEach((type) => {
      const existingPaths = Object.keys(store.addresses[type]);
      existingPaths.forEach((path) => {
        const el = store.addresses[type][path];
        if (el.transactions.includes(search.txid)) {
          search.path = path;
          search.address = el.address;
          search.type = type;
          search.found = true;
          search.result = el;
        }
      });
    });
    return search;
  }

  /**
   * Add a new transaction to an address (push a tx)
   * @param tx
   * @return {boolean}
   */
  addNewTxToAddress(tx) {
    // console.log('addNewTxToAddress', tx);
    if (tx.address && tx.txid) {
      const { type, path, found } = this.searchAddress(tx.address);
      if (!found) {
        console.log('Search was not successfull');
        return false;
      }
      this.store.addresses[type][path].transactions.push(tx.txid);
      this.store.addresses[type][path].fetchedLast = 0; // Because of the unclear state
      this.lastModified = +new Date();
      return true;
    }
    throw new Error('Invalid tx to add : tx');
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
    const addressesStore = this.store.wallets[walletId].addresses;
    const self = this;

    function importAddress(address, wId) {
      const addressObj = address;
      const { path } = addressObj;
      if (!path) throw new Error('Expected path to import an address');
      if (!wId) throw new Error('Expected walletId to import an address');
      const index = path.split('/')[5];
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
      if (!addressObj.index) addressObj.index = index;
      if (addressesStore[type][path]) {
        if (addressesStore[type][path].fetchedLast < addressObj.fetchedLast) {
          self.updateAddress(addressObj, walletId);
        }
      } else {
        addressesStore[type][path] = addressObj;
        self.lastModified = Date.now();
      }
    }
    const type = addresses.constructor.name;
    if (type === 'Object') {
      if (addresses.path) {
        const address = addresses;
        importAddress(address, walletId);
      } else {
        const addressPaths = Object.keys(addresses);
        addressPaths.forEach((path) => {
          const address = addresses[path];
          importAddress(address, walletId);
        });
      }
    } else if (type === 'Array') {
      throw new Error('Not implemented. Please create an issue on github if needed.');
    } else {
      throw new Error('Not implemented. Please create an issue on github if needed.');
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
