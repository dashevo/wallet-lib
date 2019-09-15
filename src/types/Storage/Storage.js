const { EventEmitter } = require('events');
const { cloneDeep, has } = require('lodash');

const CONSTANTS = require('../../CONSTANTS');
const addNewTxToAddress = require('./methods/addNewTxToAddress');
const addUTXOToAddress = require('./methods/addUTXOToAddress');
const announce = require('./methods/announce');
const calculateDuffBalance = require('./methods/calculateDuffBalance');
const clearAll = require('./methods/clearAll');
const configure = require('./methods/configure');
const createChain = require('./methods/createChain');
const createWallet = require('./methods/createWallet');
const getStore = require('./methods/getStore');
const getTransaction = require('./methods/getTransaction');
const importAccounts = require('./methods/importAccounts');
const importAddress = require('./methods/importAddress');
const importAddresses = require('./methods/importAddresses');
const importSingleAddress = require('./methods/importSingleAddress');
const importTransaction = require('./methods/importTransaction');
const importTransactions = require('./methods/importTransactions');

const rehydrateState = require('./methods/rehydrateState');
const saveState = require('./methods/saveState');
const searchAddress = require('./methods/searchAddress');
const searchAddressesWithTx = require('./methods/searchAddressesWithTx');
const searchTransaction = require('./methods/searchTransaction');
const searchWallet = require('./methods/searchWallet');
const updateAddress = require('./methods/updateAddress');
const updateTransaction = require('./methods/updateTransaction');
const startWorker = require('./methods/startWorker');
const stopWorker = require('./methods/stopWorker');

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
class Storage {
  constructor(opts = JSON.parse(JSON.stringify(_defaultOpts))) {
    const defaultOpts = JSON.parse(JSON.stringify(_defaultOpts));

    this.events = new EventEmitter();
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

  attachEvents(events) {
    this.events = events;
  }
}
Storage.prototype.addNewTxToAddress = addNewTxToAddress;
Storage.prototype.addUTXOToAddress = addUTXOToAddress;
Storage.prototype.announce = announce;
Storage.prototype.calculateDuffBalance = calculateDuffBalance;
Storage.prototype.clearAll = clearAll;
Storage.prototype.configure = configure;
Storage.prototype.createChain = createChain;
Storage.prototype.createWallet = createWallet;
Storage.prototype.getStore = getStore;
Storage.prototype.getTransaction = getTransaction;
Storage.prototype.importAccounts = importAccounts;
Storage.prototype.importAddress = importAddress;
Storage.prototype.importAddresses = importAddresses;
Storage.prototype.importSingleAddress = importSingleAddress;
Storage.prototype.importTransaction = importTransaction;
Storage.prototype.importTransactions = importTransactions;
Storage.prototype.rehydrateState = rehydrateState;
Storage.prototype.saveState = saveState;
Storage.prototype.searchAddress = searchAddress;
Storage.prototype.searchAddressesWithTx = searchAddressesWithTx;
Storage.prototype.searchTransaction = searchTransaction;
Storage.prototype.searchWallet = searchWallet;
Storage.prototype.updateAddress = updateAddress;
Storage.prototype.updateTransaction = updateTransaction;
Storage.prototype.startWorker = startWorker;
Storage.prototype.stopWorker = stopWorker;

module.exports = Storage;
