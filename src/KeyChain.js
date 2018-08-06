class KeyChain {
  constructor(HDRootKey) {
    this.HDRootKey = HDRootKey;
    this.keys = {

    };
  }

  generateKeyForPath(path) {
    return this.HDRootKey.derive(path);
  }

  getKeyForPath(path) {
    if (!this.keys[path]) {
      this.keys[path] = this.generateKeyForPath(path);
    }
    return this.keys[path];
  }
}
module.exports = KeyChain;
