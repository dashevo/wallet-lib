const EventEmitter = require('events');

/**
* Handle all the storage logic, it's a wrapper around the adapters
* So all the needed methods should be provided by the Storage class and the access to the adapter
* should be limited.
* */
class Storage extends EventEmitter {
  constructor() {
    super();
    this.wallets = new Map();
    this.chains = new Map();
    this.application = {};
  }
}

Storage.prototype.configure = require('./methods/configure');
Storage.prototype.createAccountStore = require('./methods/createAccountStore');
Storage.prototype.createChainStore = require('./methods/createChainStore');
Storage.prototype.createWalletStore = require('./methods/createWalletStore');
Storage.prototype.getChainStore = require('./methods/getChainStore');
Storage.prototype.getWalletStore = require('./methods/getWalletStore');

module.exports = Storage;
