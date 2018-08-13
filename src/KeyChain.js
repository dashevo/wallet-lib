class KeyChain {
  constructor(HDRootKey) {
    this.HDRootKey = HDRootKey;
    this.keys = {

    };
  }

  /**
   * Derive from HDRootKey to a specific path
   * @param path
   * @return HDPrivateKey
   */
  generateKeyForPath(path) {
    return this.HDRootKey.derive(path);
  }

  /**
   * Get a key from the cache or generate if none
   * @param path
   * @return HDPrivateKey
   */
  getKeyForPath(path) {
    if (!this.keys[path]) {
      this.keys[path] = this.generateKeyForPath(path);
    }
    return this.keys[path];
  }
}
module.exports = KeyChain;
