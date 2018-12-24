const addNewTxToAddress = require('./addNewTxToAddress');
const addUTXOToAddress = require('./addUTXOToAddress');
const announce = require('./announce');
const clearAll = require('./clearAll');
const createChain = require('./createChain');
const createWallet = require('./createWallet');
const getTransaction = require('./getTransaction');
const importAccounts = require('./importAccounts');
const importAddress = require('./importAddress');
const importAddresses = require('./importAddresses');
const importSingleAddress = require('./importSingleAddress');
const importTransaction = require('./importTransaction');
const importTransactions = require('./importTransactions');

const rehydrateState = require('./rehydrateState');
const saveState = require('./saveState');
const searchAddress = require('./searchAddress');
const searchAddressWithTx = require('./searchAddressWithTx');
const searchTransaction = require('./searchTransaction');
const searchWallet = require('./searchWallet');
const updateAddress = require('./updateAddress');
const updateTransaction = require('./updateTransaction');

const testStorage = async (adapter) => {
  if (!adapter.getItem || !adapter.setItem) {
    throw new Error('Invalid Storage Adapter, expected getItem/setItem methods');
  }
  try {
    await adapter.getItem('dummy');
  } catch (e) {
    throw new Error(`Invalid Storage Adapter : ${e}`);
  }
};
/**
 * Handle all the storage logic, it's a wrapper around the adapters
 * So all the needed methods should be provided by the Storage class and the access to the adapter
 * should be limited.
 * */
class Storage {
  constructor() {
    Object.assign(Storage.prototype, {
      addNewTxToAddress,
      addUTXOToAddress,
      announce,
      clearAll,
      createChain,
      createWallet,
      getTransaction,
      importAccounts,
      importAddress,
      importAddresses,
      importSingleAddress,
      importTransaction,
      importTransactions,
      rehydrateState,
      saveState,
      searchAddress,
      searchAddressWithTx,
      searchTransaction,
      searchWallet,

      updateAddress,
      updateTransaction,
    });
    let { adapter } = opts;
    if (adapter.constructor.name === 'Function') {
      adapter = new adapter();
    }
    testStorage(adapter);


    this.adapter = adapter;

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

    this.startWorker();
    // Map an address to it's walletid/path/type schema (used by searchAddress for speedup)
    this.mappedAddress = {};

    setTimeout(() => {
      this.init();
    }, 1);
  }

  async init() {
    await this.rehydrateState();
  }

  attachEvents(events) {
    this.events = events;
  }

  startWorker() {
    this.interval = setInterval(() => {
      if (this.lastModified > this.lastSave) {
        this.saveState();
      }
    }, 10 * 1000);
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
}
module.exports = Storage;
