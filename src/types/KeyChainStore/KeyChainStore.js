class KeyChainStore {
  constructor() {
    this.chains = new Map();
    this.walletKeyChainId = null;
  }
}

KeyChainStore.prototype.addKeyChain = require('./methods/addKeyChain');
KeyChainStore.prototype.getKeyChain = require('./methods/getKeyChain');
KeyChainStore.prototype.getKeyChains = require('./methods/getKeyChains');
KeyChainStore.prototype.getWalletKeyChain = require('./methods/getWalletKeyChain');

module.exports = KeyChainStore;
