function getKeyChain(keyChainId) {
  return this.chains.get(keyChainId);
}

module.exports = getKeyChain;
