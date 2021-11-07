const { Networks, HDPrivateKey, HDPublicKey } = require('@dashevo/dashcore-lib');
const { doubleSha256 } = require('../../utils/crypto');

function generateKeyChainId(key) {
  const keyChainIdSuffix = doubleSha256(key.toString()).toString('hex').slice(0, 10);
  return `kc${keyChainIdSuffix}`;
}

function fromOptions(opts) {
  let rootKey;
  let rootKeyType;

  if (opts) {
    if (opts.mnemonic) {
      rootKeyType = 'HDPrivateKey';
      rootKey = (typeof opts.mnemonic === 'string') ? HDPrivateKey(opts.HDPrivateKey) : opts.HDPrivateKey;
    }
    if (opts.HDPrivateKey) {
      rootKeyType = 'HDPrivateKey';
      rootKey = (typeof opts.HDPrivateKey === 'string') ? HDPrivateKey(opts.HDPrivateKey) : opts.HDPrivateKey;
    } else if (opts.HDPublicKey) {
      rootKeyType = 'HDPublicKey';
      rootKey = (typeof opts.HDPublicKey === 'string') ? HDPublicKey(opts.HDPublicKey) : opts.HDPublicKey;
    } else if (opts.privateKey) {
      rootKeyType = 'privateKey';
      rootKey = opts.privateKey;
    } else if (opts.publicKey) {
      rootKeyType = 'publicKey';
      rootKey = opts.publicKey;
    } else if (opts.address) {
      rootKeyType = 'address';
      rootKey = opts.address.toString();
    }
  }
  return { rootKeyType, rootKey };
}

class KeyChain {
  constructor(opts = {}) {
    const { rootKey, rootKeyType } = fromOptions(opts);
    if (!rootKeyType || !rootKey) throw new Error('Expect privateKey, publicKey, HDPublicKey, HDPrivateKey or Address');
    this.keyChainId = generateKeyChainId(rootKey);

    this.rootKey = rootKey;
    this.network = opts.network || rootKey.network || Networks.testnet.toString();
    this.rootKeyType = rootKeyType;
    // this.chainCode = chainCode;

    this.watchedKeys = new Map();
  }
}
KeyChain.prototype.addKeysToWatchedKeys = require('./methods/addKeysToWatchedKeys');
KeyChain.prototype.getKeyForPath = require('./methods/getKeyForPath');
KeyChain.prototype.getDIP15ExtendedKey = require('./methods/getDIP15ExtendedKey');
KeyChain.prototype.getHardenedBIP44HDKey = require('./methods/getHardenedBIP44HDKey');
KeyChain.prototype.getHardenedDIP9FeatureHDKey = require('./methods/getHardenedDIP9FeatureHDKey');
KeyChain.prototype.getHardenedDIP15AccountKey = require('./methods/getHardenedDIP15AccountKey');
KeyChain.prototype.getRootKey = require('./methods/getRootKey');
KeyChain.prototype.getWatchedAddresses = require('./methods/getWatchedAddresses');
KeyChain.prototype.getWatchedKeys = require('./methods/getWatchedKeys');
KeyChain.prototype.getWatchedPublicKeys = require('./methods/getWatchedPublicKeys');
KeyChain.prototype.removeKeysToWatchedKeys = require('./methods/removeKeysToWatchedKeys');
KeyChain.prototype.sign = require('./methods/sign');

module.exports = KeyChain;
