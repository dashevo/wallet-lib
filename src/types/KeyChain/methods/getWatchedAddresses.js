function getWatchedAddresses() {
  const keys = this.getWatchedKeys();
  return keys.map((key) => key.publicKey.toAddress().toString());
}

module.exports = getWatchedAddresses;
