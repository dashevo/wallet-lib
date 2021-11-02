function addKeyChain(keychain, opts = {}) {
  if (this.chains.has(keychain.keyChainId)) {
    throw new Error('Trying to add already existing keyChain');
  }
  this.chains.set(keychain.keyChainId, keychain);

  if (opts && opts.isWalletKeyChain && !this.walletKeyChainId) {
    this.walletKeyChainId = keychain.keyChainId;
  }
}

module.exports = addKeyChain;
