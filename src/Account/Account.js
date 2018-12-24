const _ = require('lodash');
const { EventEmitter } = require('events');
const SyncWorker = require('../plugins/Workers/SyncWorker');
const ChainWorker = require('../plugins/Workers/ChainWorker');
const BIP44Worker = require('../plugins/Workers/BIP44Worker');
const { WALLET_TYPES } = require('../CONSTANTS');
const { is } = require('../utils/index');
const EVENTS = require('../EVENTS');

const defaultOptions = {
  network: 'testnet',
  cacheTx: true,
  subscribe: true,
  allowSensitiveOperations: false,
  plugins: [],
  injectDefaultPlugins: true,
};


const addAccountToWallet = require('./addAccountToWallet');
const broadcastTransaction = require('./broadcastTransaction');
const connect = require('./connect');
const createTransaction = require('./createTransaction');
const createTransactionFromUTXOS = require('./createTransactionFromUTXOS');
const disconnect = require('./disconnect');
const fetchAddressInfo = require('./fetchAddressInfo');
const fetchStatus = require('./fetchStatus');
const fetchTransactionInfo = require('./fetchTransactionInfo');
const forceRefreshAccount = require('./forceRefreshAccount');
const generateAddress = require('./generateAddress');
const getAddress = require('./getAddress');
const getAddresses = require('./getAddresses');
const getBalance = require('./getBalance');
const getBIP44Path = require('./getBIP44Path');
const getDAP = require('./getDAP');
const getNetwork = require('./getNetwork');
const getPlugin = require('./getPlugin');
const getPrivateKeys = require('./getPrivateKeys');
const getTransaction = require('./getTransaction');
const getTransactionHistory = require('./getTransactionHistory');
const getTransactions = require('./getTransactions');
const getUnusedAddress = require('./getUnusedAddress');
const getUTXOS = require('./getUTXOS');
const injectPlugin = require('./injectPlugin');
const sign = require('./sign');
const updateNetwork = require('./updateNetwork');

class Account {
  constructor(wallet, opts = defaultOptions) {
    Object.assign(Account.prototype, {
      broadcastTransaction,
      connect,
      createTransaction,
      createTransactionFromUTXOS,
      disconnect,
      fetchAddressInfo,
      fetchStatus,
      fetchTransactionInfo,
      forceRefreshAccount,
      generateAddress,
      getAddress,
      getAddresses,
      getBalance,
      getDAP,
      getPlugin,
      getPrivateKeys,
      getTransaction,
      getTransactionHistory,
      getTransactions,
      getUnusedAddress,
      getUTXOS,
      injectPlugin,
      sign,
      updateNetwork,
    });
    if (!wallet || wallet.constructor.name !== 'Wallet') throw new Error('Expected wallet to be created and passed as param');
    if (!_.has(wallet, 'walletId')) throw new Error('Missing walletID to create an account');
    this.walletId = wallet.walletId;

    this.events = new EventEmitter();
    this.isReady = false;
    this.injectDefaultPlugins = _.has(opts, 'injectDefaultPlugins') ? opts.injectDefaultPlugins : defaultOptions.injectDefaultPlugins;
    this.allowSensitiveOperations = _.has(opts, 'allowSensitiveOperations') ? opts.allowSensitiveOperations : defaultOptions.allowSensitiveOperations;

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

    this.cacheTx = (opts.cacheTx) ? opts.cacheTx : defaultOptions.cacheTx;

    this.plugins = {
      workers: {},
      daps: {},
      standard: {},
      watchers: {},
    };

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

    this.events.emit(EVENTS.CREATED);
    addAccountToWallet(this, wallet);
    this.initialize(wallet.plugins);
  }

  async initialize(userUnsafePlugins) {
    const self = this;

    if (this.injectDefaultPlugins) {
      // TODO: Should check in other accounts if a similar is setup already
      // TODO: We want to sort them by dependencies and deal with the await this way
      // await parent if child has it in dependency
      // if not, then is it marked as requiring a first exec
      // if yes add to watcher list.
      this.injectPlugin(ChainWorker, true);

      if (this.type === WALLET_TYPES.HDWALLET) {
        // Ideally we should move out from worker to event based
        this.injectPlugin(BIP44Worker, true);
      }
      if (this.type === WALLET_TYPES.SINGLE_ADDRESS) {
        this.getAddress('0'); // We force what is usually done by the BIP44Worker.
      }
      this.injectPlugin(SyncWorker, true);
    }

    _.each(userUnsafePlugins, (UnsafePlugin) => {
      this.injectPlugin(UnsafePlugin, this.allowSensitiveOperations);
    });

    this.readinessInterval = setInterval(() => {
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
        clearInterval(self.readinessInterval);
      }
    }, 600);
    self.events.emit(EVENTS.STARTED);
  }
}

module.exports = Account;
