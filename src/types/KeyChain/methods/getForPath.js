function getForPath(path, opts = {}) {
  if (!['HDPrivateKey', 'HDPublicKey'].includes(this.rootKeyType)) {
    if (path === 0 || path === '0') return this.getRootKey();
    throw new Error('Wallet is not loaded from a mnemonic or a HDPubKey, impossible to derivate keys');
  }

  let data;
  if (this.issuedPaths.has(path)) {
    data = this.issuedPaths.get(path);
    if (opts && opts.isWatched !== undefined && data.isWatched !== opts.isWatched) {
      data.isWatched = opts.isWatched;
    }
    if (opts && opts.isUsed !== undefined && data.isUsed !== opts.isUsed) {
      data.isUsed = opts.isUsed;
    }
    return data;
  }

  const key = this.rootKey.derive(path);
  const isUsed = (opts && opts.isUsed !== undefined) ? opts.isUsed : false;
  const isWatched = (opts && opts.isWatched !== undefined) ? opts.isWatched : false;

  data = {
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
