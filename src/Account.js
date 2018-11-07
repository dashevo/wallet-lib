const _ = require('lodash');
const Dashcore = require('@dashevo/dashcore-lib');
const { EventEmitter } = require('events');
const SyncWorker = require('./plugins/Workers/SyncWorker');
const BIP44Worker = require('./plugins/Workers/BIP44Worker');
const {
  BIP44_LIVENET_ROOT_PATH, BIP44_TESTNET_ROOT_PATH, FEES, WALLET_TYPES,
} = require('./CONSTANTS');
const {
  is, dashToDuffs, duffsToDash, coinSelection,
} = require('./utils/');
const EVENTS = require('./EVENTS');

const {
  UnknownPlugin,
  UnknownDAP,
  InjectionErrorCannotInject,
  InjectionErrorCannotInjectUnknownDependency,
  ValidTransportLayerRequired,
} = require('./errors');

const defaultOptions = {
  network: 'testnet',
  mode: 'full',
  cacheTx: true,
  subscribe: true,
  forceUnsafePlugins: false,
  plugins: [],
  injectDefaultPlugins: true,
};

/**
 * Add when not existing a element account in a parent wallet
 * @param account
 * @param wallet
 */
const addAccountToWallet = function (account, wallet) {
  const { accounts } = wallet;

  const existAlready = accounts.filter(el => el.accountIndex === wallet.accountIndex).length > 0;
  if (!existAlready) {
    wallet.accounts.push(account);
  }
};
const getBIP44Path = function (network, accountIndex) {
  return (network === Dashcore.Networks.livenet)
    ? `${BIP44_LIVENET_ROOT_PATH}/${accountIndex}'`
    : `${BIP44_TESTNET_ROOT_PATH}/${accountIndex}'`;
};
const getNetwork = function (network) {
  return Dashcore.Networks[network] || Dashcore.Networks.testnet;
};
class Account {
  constructor(wallet, opts = defaultOptions) {
    if (!wallet || wallet.constructor.name !== 'Wallet') throw new Error('Expected wallet to be created and passed as param');
    if (!_.has(wallet, 'walletId')) throw new Error('Missing walletID to create an account');
    this.walletId = wallet.walletId;

    this.events = new EventEmitter();
    this.isReady = false;
    this.injectDefaultPlugins = _.has(opts, 'injectDefaultPlugins') ? opts.injectDefaultPlugins : defaultOptions.injectDefaultPlugins;

    this.type = wallet.type;

    const accountIndex = (opts.accountIndex) ? opts.accountIndex : wallet.accounts.length;
    this.accountIndex = accountIndex;

    this.network = getNetwork(wallet.network.toString());

    this.BIP44PATH = getBIP44Path(this.network, accountIndex);

    this.transactions = {};

    this.label = (opts && opts.label && is.string(opts.label)) ? opts.label : null;

    // If transport is null or invalid, we won't try to fetch anything
    this.transport = wallet.transport;

    this.store = wallet.storage.store;
    this.storage = wallet.storage;

    if (this.type === WALLET_TYPES.HDWALLET) {
      this.storage.importAccounts({
        label: this.label,
        path: this.BIP44PATH,
        network: this.network,
      }, this.walletId);
    }
    if (this.type === WALLET_TYPES.SINGLE_ADDRESS) {
      this.storage.importSingleAddress({
        label: this.label,
        path: '0',
        network: this.network,
      }, this.walletId);
    }

    this.keyChain = wallet.keyChain;
    this.mode = (opts.mode) ? opts.mode : defaultOptions.mode;

    this.cacheTx = (opts.cacheTx) ? opts.cacheTx : defaultOptions.cacheTx;
    this.plugins = wallet.plugins;
    Object.keys(this.plugins).forEach((pluginName) => {
      const item = this.plugins[pluginName];
      if (item.init) item.init(this);
    });

    this.plugins = {
      workers: {},
      daps: {},
      standard: {},
      watchers: {},
    };
    if (this.injectDefaultPlugins) {
      if (this.type === WALLET_TYPES.HDWALLET) {
        this.injectPlugin(BIP44Worker, true);
      }
      this.injectPlugin(SyncWorker, true);
    }
    const forceUnsafePlugins = _.has(opts, 'forceUnsafePlugins') ? opts.forceUnsafePlugins : defaultOptions.forceUnsafePlugins
    if (_.has(opts, 'plugins') && is.arr(opts.plugins)) {
      opts.plugins.forEach((plugin) => {
        this.injectPlugin(plugin, forceUnsafePlugins);
      });
    }

    // Handle import of cache
    if (opts.cache) {
      if (opts.cache.addresses) {
        try {
          this.storage.importAddresses(opts.cache.addresses, this.walletId);
        } catch (e) {
          this.disconnect();
          throw e;
        }
      }
      if (opts.cache.transactions) {
        try {
          this.storage.importTransactions(opts.cache.transactions);
        } catch (e) {
          console.log(e);
          this.disconnect();
          throw e;
        }
      }
    }

    const self = this;
    self.events.emit(EVENTS.STARTED);
    addAccountToWallet(this, wallet);

    const readinessInterval = setInterval(() => {
      const watchedWorkers = Object.keys(this.plugins.watchers);
      let readyWorkers = 0;
      watchedWorkers.forEach((workerName) => {
        if (this.plugins.watchers[workerName].ready === true) {
          readyWorkers += 1;
        }
      });
      if (readyWorkers === watchedWorkers.length) {
        self.events.emit(EVENTS.READY);
        self.isReady = true;
        clearInterval(readinessInterval);
      }
    }, 600);
  }

  getPlugin(pluginName) {
    const loweredPluginName = pluginName.toLowerCase();
    const stdPluginsList = Object.keys(this.plugins.standard).map(key => key.toLowerCase());
    if (stdPluginsList.includes(loweredPluginName)) {
      return this.plugins.standard[loweredPluginName];
    }
    throw new UnknownPlugin(loweredPluginName);
  }

  getDAP(dapName) {
    const loweredDapName = dapName.toLowerCase();
    const dapsList = Object.keys(this.plugins.daps).map(key => key.toLowerCase());
    if (dapsList.includes(loweredDapName)) {
      return this.plugins.daps[loweredDapName];
    }
    throw new UnknownDAP(loweredDapName);
  }

  /**
   * Broadcast a Transaction to the transport layer
   * @param rawtx {String} - the hexa representation of the transaxtion
   * @param isIs - If the tx is InstantSend tx todo: Should be automatically deducted from the rawtx
   * @return {Promise<*>}
   */
  async broadcastTransaction(rawtx, isIs = false) {
    if (!this.transport.isValid) throw new ValidTransportLayerRequired('broadcast');

    const txid = await this.transport.sendRawTransaction(rawtx, isIs);
    if (is.txid(txid)) {
      const {
        inputs, outputs,
      } = new Dashcore.Transaction(rawtx).toObject();

      let totalSatoshis = 0;
      outputs.forEach((out) => {
        totalSatoshis += out.satoshis;
      });

      const affectedTxs = [];
      inputs.forEach((input) => {
        affectedTxs.push(input.prevTxId);
      });

      affectedTxs.forEach((affectedtxid) => {
        const { path, type } = this.storage.searchAddressWithTx(affectedtxid);
        const address = this.storage.store.wallets[this.walletId].addresses[type][path];
        const cleanedUtxos = [];
        address.utxos.forEach((utxo) => {
          if (utxo.txid === affectedtxid) {
            totalSatoshis -= utxo.satoshis;
            address.balanceSat -= utxo.satoshis;
          } else {
            cleanedUtxos.push(utxo);
          }
        });
        address.utxos = cleanedUtxos;
        console.log('Broadcast totalSatoshi', totalSatoshis);
        // this.storage.store.addresses[type][path].fetchedLast = 0;// In order to trigger a refresh
        this.events.emit(EVENTS.BALANCE_CHANGED, { delta: -totalSatoshis });
      });
    }
    return txid;
  }

  /**
   * Fetch a specific txid from the transport layer
   * @param transactionid - The transaction id to fetch
   * @return {Promise<{txid, blockhash, blockheight, blocktime, fees, size, vout, vin, txlock}>}
   */
  async fetchTransactionInfo(transactionid) {
    if (!this.transport.isValid) throw new ValidTransportLayerRequired('fetchTransactionInfo');

    // valueIn, valueOut,
    const {
      txid, blockhash, blockheight, blocktime, fees, size, vin, vout, txlock,
    } = await this.transport.getTransaction(transactionid);

    const feesInSat = is.float(fees) ? dashToDuffs(fees) : (fees);
    return {
      txid,
      blockhash,
      blockheight,
      blocktime,
      fees: feesInSat,
      size,
      vout,
      vin,
      txlock,
    };
  }

  async fetchStatus() {
    if (!this.transport.isValid) throw new ValidTransportLayerRequired('status');
    return (this.transport) ? this.transport.getStatus() : false;
  }

  sign(object, privateKeys, sigType) {
    return this.keyChain.sign(object, privateKeys, sigType);
  }

  /**
   * Fetch a specific address from the transport layer
   * @param addressObj - AddressObject having an address and a path
   * @param fetchUtxo - If we also query the utxo (default: yes)
   * @return {Promise<addrInfo>}
   */
  async fetchAddressInfo(addressObj, fetchUtxo = true) {
    if (!this.transport.isValid) throw new ValidTransportLayerRequired('fetchAddressInfo');
    const self = this;
    const { address, path } = addressObj;
    const {
      balanceSat, unconfirmedBalanceSat, transactions,
    } = await this.transport.getAddressSummary(address);

    const addrInfo = {
      address,
      path,
      balanceSat,
      unconfirmedBalanceSat,
      transactions,
      fetchedLast: +new Date(),
    };
    addrInfo.used = (transactions.length > 0);
    if (transactions.length > 0) {
      // If we have cacheTx, then we will check if we know this transactions
      if (self.cacheTx) {
        transactions.forEach(async (tx) => {
          const knownTx = Object.keys(self.store.transactions);

          if (!knownTx.includes(tx)) {
            const txInfo = await self.fetchTransactionInfo(tx);
            // console.log(txInfo)
            await self.storage.importTransactions(txInfo);
          }
        });
      }
    }

    // We do not need to fetch UTXO if we don't have any money there :)
    function parseUTXO(utxos) {
      const parsedUtxos = [];
      utxos.forEach((utxo) => {
        parsedUtxos.push(Object.assign({}, {
          satoshis: utxo.satoshis,
          txid: utxo.txid,
          address: utxo.address,
          outputIndex: utxo.vout,
          scriptPubKey: utxo.scriptPubKey,
          scriptSig: utxo.scriptSig,
        }));
      });
      return parsedUtxos;
    }

    if (fetchUtxo) {
      const originalUtxo = (await self.transport.getUTXO(address));
      if (originalUtxo.length > 0) {
      }
      const utxo = (balanceSat > 0) ? parseUTXO(originalUtxo) : [];
      if (utxo.length > 0) {
        self.storage.addUTXOToAddress(utxo, addressObj.address);
      }
    }

    return addrInfo;
  }

  /**
   * Get transaction from the store
   * @return {Object} transactions - All transaction in the store
   */
  getTransactions() {
    return this.store.transactions;
  }

  /**
   * Get all the addresses from the store from a given type
   * @param external - Default: true, return either external or internal type addresses
   * @return {Object} address - All address matching the type
   */
  getAddresses(external = true) {
    const type = (external) ? 'external' : 'internal';
    return this.store.wallets[this.walletId].addresses[type];
  }

  /**
   * Get a specific addresss based on the index and type of address.
   * @param index - The index on the type
   * @param external - Type of the address (external, internal,...)
   * @return <AddressInfo>
   */
  getAddress(index = 0, external = true) {
  // eslint-disable-next-line no-nested-ternary
    const type = (this.type === WALLET_TYPES.SINGLE_ADDRESS)
      ? 'misc'
      : ((external) ? 'external' : 'internal');

    // eslint-disable-next-line no-nested-ternary
    const path = (type === 'misc')
      ? '0'
      : ((external === true) ? `${this.BIP44PATH}/0/${index}` : `${this.BIP44PATH}/1/${index}`);

    const { wallets } = this.storage.getStore();
    const addressType = wallets[this.walletId].addresses[type];
    return (addressType[path]) ? addressType[path] : this.generateAddress(path);
  }

  /**
   * Get an unused address from the store
   * @param external - (default: true) - Type of the requested usused address
   * @param skip
   * @return {*}
   */
  getUnusedAddress(external = true, skip = 0) {
    const type = (external) ? 'external' : 'internal';
    let unused = {
      address: '',
    };
    const skipped = 0;
    const { walletId } = this;
    const keys = Object.keys(this.store.wallets[walletId].addresses[type]);


    for (let i = 0, skipped = 0; i < keys.length; i++) {
      const key = keys[i];
      const el = (this.store.wallets[walletId].addresses[type][key]);
      unused = el;
      if (el.used === false) {
        if (skipped < skip) {
          skipped += 1;
        } else {
          break;
        }
      }
      // Generate extra address when needed. BIP44 should take care of that.
      console.warn('getUnusedAddress had to generate new address.', i, skipped);
    }

    if (skipped < skip) {
      unused = this.getAddress(skipped);
    }
    if (unused.address === '') {
      return this.getAddress(0, external);
    }
    return unused;
  }

  /**
   * Get all the transaction history already formated
   * todo: add a raw format
   * @return {Promise<any[]>}
   */
  async getTransactionHistory() {
    const self = this;
    let txs = [];
    const { walletId } = this;
    Object.keys(this.store.wallets[walletId].addresses.external).forEach((key) => {
      const el = this.store.wallets[walletId].addresses.external[key];
      if (el.transactions && el.transactions.length > 0) {
        txs = txs.concat(el.transactions);
      }
    });
    Object.keys(this.store.wallets[walletId].addresses.internal).forEach((key) => {
      const el = this.store.wallets[walletId].addresses.internal[key];
      if (el.transactions && el.transactions.length > 0) {
        txs = txs.concat(el.transactions);
      }
    });

    txs = txs.filter((item, pos, txslist) => txslist.indexOf(item) === pos);
    const p = [];

    txs.forEach((txid) => {
      const search = self.storage.searchTransaction(txid);
      if (!search.found) {
        p.push(self.getTransaction(txid));
      } else {
        p.push(search.result);
      }
    });

    const resolvedPromises = await Promise.all(p) || [];

    function cleanUnknownAddr(data, wId) {
      const knownAddr = [];
      Object.keys(self.store.wallets[wId].addresses.external).forEach((key) => {
        const el = self.store.wallets[wId].addresses.external[key];
        knownAddr.push(el.address);
      });
      Object.keys(self.store.wallets[wId].addresses.internal).forEach((key) => {
        const el = self.store.wallets[wId].addresses.internal[key];
        knownAddr.push(el.address);
      });
      Object.keys(self.store.wallets[wId].addresses.misc).forEach((key) => {
        const el = self.store.wallets[wId].addresses.misc[key];
        knownAddr.push(el.address);
      });

      return data.filter(el => (knownAddr.includes(el.address)))[0];
    }

    const history = resolvedPromises.map((el) => {
      let isSent = false;
      if (el.vin) {
        el.vin.forEach((vin) => {
          const { addr } = vin;
          if (this.storage.searchAddress(addr).found) {
            isSent = true;
          }
        });
      }

      const cleanElement = {
        type: (isSent) ? 'sent' : 'receive',
        txid: el.txid,
        time: el.time || el.blocktime || 0,
        from: (el.vin) ? el.vin.map(vin => vin.addr) : 'unknown',
      };
      if (el.vout) {
        cleanElement.to = cleanUnknownAddr(el.vout.map(vout => ({
          address: vout.scriptPubKey.addresses[0],
          amount: vout.value,
        })), this.walletId);
      } else {
        cleanElement.to = 'unknown';
      }


      return cleanElement;
    });

    return history;
  }

  /**
   * Use the transport layer to fetch a specific transaction matchin a txid
   * @param txid
   * @return {Promise<*>}
   */
  async getTransaction(txid = null) {
    const self = this;
    return (txid !== null && self.transport) ? (self.transport.getTransaction(txid)) : [];
  }

  /**
   * Generate an address from a path and import it to the store
   * @param path
   * @return {addressObj} Address information
   * */
  generateAddress(path) {
    if (!path) throw new Error('Expected path to generate an address');
    const index = path.split('/')[5];

    const privateKey = this.keyChain.getKeyForPath(path);

    const address = new Dashcore.Address(privateKey.publicKey.toAddress(), this.network).toString();

    const addressData = {
      path,
      index,
      address,
      // privateKey,
      transactions: [],
      balanceSat: 0,
      unconfirmedBalanceSat: 0,
      utxos: [],
      fetchedLast: 0,
      used: false,
    };
    this.storage.importAddresses(addressData, this.walletId);
    return addressData;
  }

  /**
   * Return the total balance of an account.
   * Expect paralel fetching/discovery to be activated.
   * @return {number} Balance in dash
   */
  getBalance(unconfirmed = true, displayDuffs = true) {
    const self = this;
    let totalSat = 0;
    const { walletId, storage } = this;
    const { addresses } = storage.getStore().wallets[walletId];
    const subwallets = Object.keys(addresses);
    subwallets.forEach((subwallet) => {
      const paths = Object.keys(self.store.wallets[walletId].addresses[subwallet]);
      paths.forEach((path) => {
        const address = self.store.wallets[walletId].addresses[subwallet][path];
        const { unconfirmedBalanceSat, balanceSat } = address;
        totalSat += (unconfirmed) ? unconfirmedBalanceSat + balanceSat : balanceSat;
      });
    });

    return (displayDuffs) ? totalSat : duffsToDash(totalSat);
  }

  /**
   * Return all the utxos (unspendable included)
   * @param {Boolean} onlyAvailable - Only return available utxos (spendable)
   * @return {Array}
   */
  getUTXOS(onlyAvailable = true) {
    let utxos = [];

    const self = this;
    const { walletId } = this;
    const subwallets = Object.keys(this.store.wallets[walletId].addresses);
    subwallets.forEach((subwallet) => {
      const paths = Object.keys(self.store.wallets[walletId].addresses[subwallet]);
      paths.forEach((path) => {
        const address = self.store.wallets[walletId].addresses[subwallet][path];
        if (address.utxos) {
          if (!(onlyAvailable && address.locked)) {
            const utxo = address.utxos;
            if (utxo.length > 0) {
              const modifiedUtxo = Array.from(utxo);
              modifiedUtxo.forEach((el) => {
                el.address = address.address;
              });
              utxos = utxos.concat(modifiedUtxo);
            }
          }
        }
      });
    });
    utxos = utxos.sort((a, b) => b.satoshis - a.satoshis);

    return utxos;
  }

  /**
   * Create a transaction based around a provided utxos
   * @param opts - Options object
   * @return {string}
   */
  createTransactionFromUTXOS(opts) {
    const tx = new Dashcore.Transaction();
    if (!opts || (!opts.utxos) || opts.utxos.length === 0) {
      throw new Error('A utxos set is needed');
    }
    if (!opts || (!opts.recipient)) {
      throw new Error('A recipient is expected to create a transaction');
    }
    const { recipient, utxos } = opts;

    tx.from(utxos);

    // eslint-disable-next-line no-underscore-dangle
    tx.to(recipient, tx._getInputAmount());

    tx.change(recipient);
    tx.fee(FEES.DEFAULT_FEE);

    const addressList = utxos.map(el => ((el.address)));
    const privateKeys = _.has(opts, 'privateKeys') ? opts.privateKeys : this.getPrivateKeys(addressList);
    const signedTx = this.keyChain.sign(tx, privateKeys, Dashcore.crypto.Signature.SIGHASH_ALL);
    return signedTx.toString();
  }

  /**
   * Create a transaction based around on the provided information
   * @param opts - Options object
   * @param opts.amount - Amount in dash that you want to send
   * @param opts.satoshis - Amount in satoshis
   * @param opts.to - Address of the recipient
   * @param opts.isInstantSend - If you want to use IS or stdTx.
   * @param opts.deductFee - Deduct fee
   * @param opts.privateKeys - Overwrite default behavior : auto-searching local matching keys.
   * @param opts.privateKeys - Overwrite default behavior : auto-searching local matching keys.
   * @return {String} - rawTx
   */
  createTransaction(opts) {
    const self = this;
    const tx = new Dashcore.Transaction();

    if (!opts || (!opts.amount && !opts.satoshis)) {
      throw new Error('An amount in dash or in satoshis is expected to create a transaction');
    }
    const satoshis = (opts.amount && !opts.satoshis) ? dashToDuffs(opts.amount) : opts.satoshis;
    if (!opts || (!opts.to)) {
      throw new Error('A recipient is expected to create a transaction');
    }
    const deductFee = _.has(opts, 'deductFee')
      ? opts.deductFee
      : true;

    const outputs = [{ address: opts.to, satoshis }];

    const utxosList = this.getUTXOS();

    utxosList.map((utxo) => {
      const utxoTx = self.storage.searchTransaction(utxo.txid);
      if (utxoTx.found) {
        // eslint-disable-next-line no-param-reassign
        utxo.scriptSig = utxoTx.result.vin[0].scriptSig.hex;
      }
      return utxo;
    });

    const feeCategory = (opts.isInstantSend) ? 'instant' : 'normal';
    const selection = coinSelection(utxosList, outputs, deductFee, feeCategory);
    const selectedUTXOs = selection.utxos;
    const selectedOutputs = selection.outputs;
    const {
      // feeCategory,
      estimatedFee,
    } = selection;
    console.log(selection)

    tx.to(selectedOutputs);

    // We parse our inputs, transform them into a Dashcore UTXO object.
    const inputs = selectedUTXOs.reduce((accumulator, current) => {
      const unspentoutput = new Dashcore.Transaction.UnspentOutput(current);
      accumulator.push(unspentoutput);

      return accumulator;
    }, []);

    if (!inputs) return tx;
    // We can now add direction our inputs to the Dashcore TX object
    tx.from(inputs);

    // In case or excessive fund, we will get that to an address in our possession
    const addressChange = this.getUnusedAddress(false, 1).address;
    tx.change(addressChange);


    // TODO : Deduct fee operation should happen here ?

    // const feeRate = (opts.isInstantSend) ? feeCalculation('instantSend') : feeCalculation();
    // if (feeRate.type === 'perBytes') {
    // console.log(feeRate.value * tx.size)
    // tx.feePerKb(feeRate.value * 10);
    // tx.fee(FEES.DEFAULT_FEE);
    // }
    // if (feeRate.type === 'perInputs') {
    //   const fee = inputs.length * FEES.NORMAL;
    //   tx.fee(fee);
    // }
    tx.fee(estimatedFee);
    const addressList = selectedUTXOs.map(el => ((el.address)));
    const privateKeys = _.has(opts, 'privateKeys') ? opts.privateKeys : this.getPrivateKeys(addressList);
    const transformedPrivateKeys = [];
    privateKeys.forEach((pk) => {
      if (pk.constructor.name === 'PrivateKey') {
        transformedPrivateKeys.push(pk);
      } else if (pk.constructor.name === 'HDPrivateKey') transformedPrivateKeys.push(pk.privateKey);
      else console.log('Unexpected pk type', pk, pk.constructor.name, pk instanceof Dashcore.HDPrivateKey);
    });
    try {
      const signedTx = this.keyChain.sign(tx, transformedPrivateKeys, Dashcore.crypto.Signature.SIGHASH_ALL);
      // console.log(signedTx.verify())
      return signedTx.toString();
    } catch (e) {
      if (e.message === 'Not fully signed transaction') {
        console.log(tx, transformedPrivateKeys);
      }
      return e;
    }
  }


  /**
   * Return all the private keys of the parameters passed addresses
   * @param addressList<String>
   * @return {Array}<HDPrivateKey>
   */
  getPrivateKeys(addressList) {
    let addresses = [];
    let privKeys = [];
    if (addressList.constructor.name === 'Object') {
      addresses = [addressList];
    } else { addresses = addressList; }

    const { walletId } = this;
    const self = this;
    const subwallets = Object.keys(this.store.wallets[walletId].addresses);
    subwallets.forEach((subwallet) => {
      const paths = Object.keys(self.store.wallets[walletId].addresses[subwallet]);
      paths.forEach((path) => {
        const address = self.store.wallets[walletId].addresses[subwallet][path];
        if (addresses.includes(address.address)) {
          const privateKey = self.keyChain.getKeyForPath(path);
          privKeys = privKeys.concat([privateKey]);
        }
      });
    });

    return privKeys;
  }

  /**
   * Force a refresh of all the addresses informations (utxo, balance, txs...)
   * todo : Use a taskQueue where this would just emit the ask for a refresh.
   * @return {Boolean}
   */
  forceRefreshAccount() {
    const addressStore = this.storage.store.wallets[this.walletId].addresses;
    ['internal', 'external', 'misc'].forEach((type) => {
      Object.keys(addressStore[type]).forEach((path) => {
        addressStore[type][path].fetchedLast = 0;
      });
    });
    return true;
  }

  // TODO : Add tests
  updateNetwork(network) {
    console.log(`Account network - update to(${network}) - from(${this.network}`);
    if (is.network(network) && network !== this.network) {
      this.BIP44PATH = getBIP44Path(network, this.accountIndex);
      this.network = getNetwork(network);
      this.storage.store.wallets[this.walletId].network = network.toString();
      if (this.transport.isValid) {
        return this.transport.updateNetwork(network);
      }
    }
    return false;
  }

  /**
   * This method will disconnect from all the opened streams, will stop all running workers
   * and force a saving of the state.
   * You want to use this method at the end of your life cycle of this lib.
   * @return {Boolean}
   */
  disconnect() {
    if (this.transport.isValid) {
      this.transport.disconnect();
    }
    if (this.plugins.workers) {
      const workersKey = Object.keys(this.plugins.workers);
      workersKey.forEach((key) => {
        this.plugins.workers[key].stopWorker();
      });
    }
    if (this.storage) {
      this.storage.saveState();
      this.storage.stopWorker();
    }
    return true;
  }

  /**
   * This method will connect to all streams and workers available
   * @return {Boolean}
   */
  connect() {
    if (this.transport.isValid) {
      this.transport.connect();
    }
    if (this.plugins.workers) {
      const workersKey = Object.keys(this.plugins.workers);
      workersKey.forEach((key) => {
        this.plugins.workers[key].startWorker();
      });
    }
    if (this.storage) {
      this.storage.startWorker();
    }
    return true;
  }

  async injectPlugin(UnsafePlugin, force = false) {
    const self = this;
    return new Promise((res, rej) => {
      const isInit = !(typeof UnsafePlugin === 'function');
      const plugin = (isInit) ? UnsafePlugin : new UnsafePlugin();
      if (_.isEmpty(plugin)) rej(new InjectionErrorCannotInject('Empty plugin'));

      // All plugins will require the event object
      const { pluginType } = plugin;

      const pluginName = plugin.constructor.name.toLowerCase();
      plugin.inject('events', self.events);

      // Check for dependencies
      const deps = plugin.dependencies || [];

      const injectedPlugins = Object.keys(this.plugins.standard).map(key => key.toLowerCase());
      const injectedDaps = Object.keys(this.plugins.daps).map(key => key.toLowerCase());
      deps.forEach((dependencyName) => {
        if (_.has(self, dependencyName)) {
          plugin.inject(dependencyName, self[dependencyName], force);
        } else if (typeof self[dependencyName] === 'function') {
          plugin.inject(dependencyName, self[dependencyName].bind(self), force);
        } else {
          const loweredDependencyName = dependencyName.toLowerCase();
          if (injectedPlugins.includes(loweredDependencyName)) {
            plugin.inject(dependencyName, this.plugins.standard[loweredDependencyName], true);
          } else if (injectedDaps.includes(loweredDependencyName)) {
            plugin.inject(dependencyName, this.plugins.daps[loweredDependencyName], true);
          } else rej(new InjectionErrorCannotInjectUnknownDependency(dependencyName));
        }
      });
      switch (pluginType) {
        case 'Worker':
          if (plugin.executeOnStart === true) {
            if (plugin.firstExecutionRequired === true) {
              const watcher = {
                ready: false,
                started: false,
              };
              self.plugins.watchers[pluginName] = watcher;


              const startWatcher = watcher => watcher.started = true;
              const setReadyWatch = watcher => watcher.ready = true;

              const onStartedEvent = () => startWatcher(watcher);
              const onExecuteEvent = () => setReadyWatch(watcher);

              self.events.on(`WORKER/${pluginName.toUpperCase()}/STARTED`, onStartedEvent);
              self.events.on(`WORKER/${pluginName.toUpperCase()}/EXECUTED`, onExecuteEvent);
            }
            plugin.startWorker();
          }
          self.plugins.workers[pluginName] = plugin;
          break;
        case 'DAP':
          self.plugins.daps[pluginName] = plugin;
          break;
        case 'StandardPlugin':
        default:
          self.plugins.standard[pluginName] = plugin;
          break;
      }
      res(plugin);
    });
  }
}

module.exports = Account;
