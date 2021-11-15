function getForPath(path, opts = {}) {
  if (!['HDPrivateKey', 'HDPublicKey'].includes(this.rootKeyType)) {
    if (path === 0 || path === '0') return this.getRootKey();
    throw new Error('Wallet is not loaded from a mnemonic or a HDPubKey, impossible to derivate keys');
  }

  if (this.issuedPaths.has(path)) {
    return this.issuedPaths.get(path);
  }

  const key = this.rootKey.derive(path);
  const isUsed = (opts && opts.isUsed !== undefined) ? opts.isUsed : false;
  const isWatched = (opts && opts.isWatched !== undefined) ? opts.isWatched : false;

  const data = {
    path,
    key,
    isUsed,
    isWatched,
    address: key.publicKey.toAddress(this.network),
  };

  this.issuedPaths.set(path, data);
  return data;
}

module.exports = getForPath;
