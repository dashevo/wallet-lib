const { cloneDeep } = require('lodash');
const { is } = require('./utils');

const defaultOpts = {

};

const initialStore = {
  transactions: {},
  addresses: {
    internal: {},
    external: {},
    misc: {},
  },
  accounts: {},
};
class Storage {
  constructor(opts = defaultOpts) {
    this.adapter = opts.adapter;

    this.store = cloneDeep(initialStore);
    this.lastRehydrate = null;
    this.lastSave = null;
    this.lastModified = null;


    this.interval = setInterval(() => {
      if (this.lastModified > this.lastSave) {
        this.saveState();
      }
    }, 30 * 1000);

    setTimeout(() => {
      this.init();
    }, 1);
  }

  stopWorker() {
    clearInterval(this.interval);
    this.interval = null;
    return true;
  }

  getStore() {
    return Object.assign({}, this.store);
  }

  async init() {
    await this.rehydrateState();
  }

  async rehydrateState() {
    this.store.transactions = (this.adapter) ? (await this.adapter.getItem('transactions') || this.store.transactions) : this.store.transactions;
    this.store.addresses = (this.adapter) ? (await this.adapter.getItem('addresses') || this.store.addresses) : this.store.addresses;
    this.store.accounts = (this.adapter) ? (await this.adapter.getItem('accounts') || this.store.accounts) : this.store.accounts;
    this.lastRehydrate = +new Date();
  }

  async saveState() {
    const self = this;
    await this.adapter.setItem('transactions', { ...self.store.transactions });
    await this.adapter.setItem('addresses', { ...self.store.addresses });
    await this.adapter.setItem('accounts', { ...self.store.accounts });
    this.lastSave = +new Date();
    return true;
  }

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
      throw new Error('Not implemented. Please create an issue on github if needed.');
    }
    return true;
  }

  importAccounts(accounts) {
    const type = accounts.constructor.name;
    const accList = this.store.accounts;

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
      throw new Error('Not implemented. Please create an issue on github if needed.');
    }
    return true;
  }

  updateAddress(address) {
    const addressesStore = this.store.addresses;
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

    addressesStore[type][path] = address;
    this.lastModified = Date.now();
    return true;
  }

  searchAddress(address) {
    const search = {
      address,
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
        if (el.address === search.address) {
          search.path = path;
          search.type = type;
          search.found = true;
          search.result = el;
        }
      });
    });
    return search;
  }

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

  importAddresses(addresses) {
    const addressesStore = this.store.addresses;
    const self = this;

    function importAddress(address) {
      const addressObj = address;
      const { path } = addressObj;
      if (!path) throw new Error('Expected path to generate an address');
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
      if (!addressObj.index) addressObj.index = index;
      if (addressesStore[type][path]) {
        if (addressesStore[type][path].fetchedLast < addressObj.fetchedLast) {
          self.updateAddress(addressObj);
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
        importAddress(address);
      } else {
        const addressPaths = Object.keys(addresses);
        addressPaths.forEach((path) => {
          const address = addresses[path];
          importAddress(address);
        });
      }
    } else if (type === 'Array') {
      throw new Error('Not implemented. Please create an issue on github if needed.');
    } else {
      throw new Error('Not implemented. Please create an issue on github if needed.');
    }
    return true;
  }

  async clearAll() {
    this.store = cloneDeep(initialStore);
    return this.saveState();
  }
}

module.exports = Storage;
