function getWatchedPublicKeys() {
  const keys = this.getWatchedKeys();
  return keys.map((key) => key.publicKey.toString());
}

module.exports = getWatchedPublicKeys;
