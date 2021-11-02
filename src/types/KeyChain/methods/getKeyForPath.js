function getKeyForPath(path) {
  if (!['HDPrivateKey', 'HDPublicKey'].includes(this.rootKeyType)) {
    throw new Error('Wallet is not loaded from a mnemonic or a HDPubKey, impossible to derivate keys');
  }
  return this.rootKey.derive(path);
}

module.exports = getKeyForPath;
