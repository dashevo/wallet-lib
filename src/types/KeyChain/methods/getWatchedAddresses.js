function getWatchedAddresses(opts = {}) {
  const keys = this.getWatchedKeys();

  const mapKeyToAddress = (key) => {
    const network = opts.network || key.network || 'testnet';
    return key.toAddress
      ? key.toAddress(network).toString()
      : key.publicKey.toAddress(network).toString();
  };

  return keys.map(mapKeyToAddress);
}

module.exports = getWatchedAddresses;
