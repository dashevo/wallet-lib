function getWalletKeyChain() {
  const keyChainId = this.walletKeyChainId;
  return this.chains.get(keyChainId);
}

module.exports = getWalletKeyChain;
