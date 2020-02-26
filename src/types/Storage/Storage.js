const { EventEmitter2: EventEmitter } = require('eventemitter2');
const { cloneDeep, has } = require('lodash');

const CONSTANTS = require('../../CONSTANTS');

const initialStore = {
  wallets: {},
  transactions: {},
  chains: {},
};
// eslint-disable-next-line no-underscore-dangle
const _defaultOpts = {
  rehydrate: true,
  autosave: true,
  autosaveIntervalTime: CONSTANTS.STORAGE.autosaveIntervalTime,
  network: 'testnet',
};
/**
 * Handle all the storage logic, it's a wrapper around the adapters
 * So all the needed methods should be provided by the Storage class and the access to the adapter
 * should be limited.
 * */
class Storage extends EventEmitter {
  constructor(opts = JSON.parse(JSON.stringify(_defaultOpts))) {
    super({ wildcard: true });
    const defaultOpts = JSON.parse(JSON.stringify(_defaultOpts));

    this.store = cloneDeep(initialStore);
    this.rehydrate = has(opts, 'rehydrate') ? opts.rehydrate : defaultOpts.rehydrate;
    this.autosave = has(opts, 'autosave') ? opts.autosave : defaultOpts.autosave;
    this.autosaveIntervalTime = has(opts, 'autosaveIntervalTime')
      ? opts.autosaveIntervalTime
      : defaultOpts.autosaveIntervalTime;

    this.lastRehydrate = null;
    this.lastSave = null;
    this.lastModified = null;
    this.network = has(opts, 'network') ? opts.network.toString() : defaultOpts.network;
    // // Map an address to it's walletid/path/type schema (used by searchAddress for speedup)
    this.mappedAddress = {};
  }
}
Storage.prototype.addNewTxToAddress = require('./methods/addNewTxToAddress');
Storage.prototype.addUTXOToAddress = require('./methods/addUTXOToAddress');
Storage.prototype.announce = require('./methods/announce');
Storage.prototype.calculateDuffBalance = require('./methods/calculateDuffBalance');
Storage.prototype.clearAll = require('./methods/clearAll');
Storage.prototype.configure = require('./methods/configure');
Storage.prototype.createChain = require('./methods/createChain');
Storage.prototype.createWallet = require('./methods/createWallet');
Storage.prototype.getStore = require('./methods/getStore');
Storage.prototype.getBlockHeader = require('./methods/getBlockHeader');
Storage.prototype.getTransaction = require('./methods/getTransaction');
Storage.prototype.importAccounts = require('./methods/importAccounts');
Storage.prototype.importAddress = require('./methods/importAddress');
Storage.prototype.importBlockHeader = require('./methods/importBlockHeader');
Storage.prototype.importAddresses = require('./methods/importAddresses');
Storage.prototype.importSingleAddress = require('./methods/importSingleAddress');
Storage.prototype.importTransaction = require('./methods/importTransaction');
Storage.prototype.importTransactions = require('./methods/importTransactions');
Storage.prototype.rehydrateState = require('./methods/rehydrateState');
Storage.prototype.saveState = require('./methods/saveState');
Storage.prototype.searchAddress = require('./methods/searchAddress');
Storage.prototype.searchAddressesWithTx = require('./methods/searchAddressesWithTx');
Storage.prototype.searchBlockHeader = require('./methods/searchBlockHeader');
Storage.prototype.searchTransaction = require('./methods/searchTransaction');
Storage.prototype.searchWallet = require('./methods/searchWallet');
Storage.prototype.updateAddress = require('./methods/updateAddress');
Storage.prototype.updateTransaction = require('./methods/updateTransaction');
Storage.prototype.startWorker = require('./methods/startWorker');
Storage.prototype.stopWorker = require('./methods/stopWorker');

module.exports = Storage;
