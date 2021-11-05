module.exports = function getAddressesToSync(opts = {}) {
  return this.keyChainStore.getKeyChains()
    .map((keychain) => keychain.getWatchedAddresses(opts))
    .reduce((pre, cur) => pre.concat(cur));
};
