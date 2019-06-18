const {
  PrivateKey, HDPublicKey, crypto, Transaction, Networks,
} = require('@dashevo/dashcore-lib');
const { has } = require('lodash');
const { BIP44_TESTNET_ROOT_PATH, BIP44_LIVENET_ROOT_PATH } = require('./CONSTANTS');

const defaultOpts = {
  network: Networks.testnet,
  keys: {},
};

class KeyChain {
  constructor(opts) {
    if (!opts) throw new Error('Expect some parameters to construct keychain');
    if (has(opts, 'HDPrivateKey')) {
      this.type = 'HDPrivateKey';
      this.HDPrivateKey = opts.HDPrivateKey;
    } else if (has(opts, 'HDPublicKey')) {
      this.type = 'HDPublicKey';
      this.HDPublicKey = opts.HDPublicKey;
    } else if (has(opts, 'privateKey')) {
      this.type = 'privateKey';
      this.privateKey = opts.privateKey;
    } else {
      throw new Error('Bad arguments. Cannot construct keychain.');
    }
    this.network = defaultOpts.network;
    if (opts.network) this.network = opts.network;
    this.keys = defaultOpts.keys;
    if (opts.keys) this.keys = opts.keys;
  }

  updateNetwork(network = defaultOpts.network) {
    this.network = network;
  }

  /**
   * Derive from HDPrivateKey to a specific path
   * @param path
   * @param type - {HDPrivateKey|HDPublicKey} def : HDPrivateKey - set the type of returned keys
   * @return HDPrivateKey
   */
  generateKeyForPath(path, type = 'HDPrivateKey') {
    if (!['HDPrivateKey', 'HDPublicKey'].includes(this.type)) {
      console.error('Wallet is not loaded from a mnemonic or a HDPubKey, impossible to derivate keys');
      return null;
    }
    const HDKey = this[this.type];
    const hdPrivateKey = HDKey.derive(path);
    if (type === 'HDPublicKey') return HDPublicKey(hdPrivateKey);
    return hdPrivateKey;
  }

  /**
   * Derive from HDPrivateKey to a child
   * @param index - {Number} - Child index to derivee to
   * @param type - {HDPrivateKey|HDPublicKey} def : HDPrivateKey - set the type of returned keys
   * @return HDPrivateKey
   */
  generateKeyForChild(index, type = 'HDPrivateKey') {
    if (!['HDPrivateKey', 'HDPublicKey'].includes(this.type)) {
      console.error('Wallet is not loaded from a mnemonic or a HDPubKey, impossible to derivate child');
      return null;
    }
    const hdPublicKey = this.HDPublicKey.deriveChild(index);
    if (type === 'HDPublicKey') return HDPublicKey(hdPublicKey);
    return hdPublicKey;
  }

  getPrivateKey() {
    let pk;
    if (this.type === 'HDPrivateKey') {
      pk = PrivateKey(this.HDPrivateKey.privateKey);
    }
    if (this.type === 'privateKey') {
      pk = PrivateKey(this.privateKey);
    }
    return pk;
  }

  /**
   * Get a key from the cache or generate if none
   * @param path
   * @param type - def : HDPrivateKey - Expected return datatype of the keys
   * @return {HDPrivateKey | HDExtPublicKey}
   */
  getKeyForPath(path, type = 'HDPrivateKey') {
    if (type === 'HDPublicKey') {
      // In this case, we do not generate or keep in cache.
      return this.generateKeyForPath(path, type);
    }
    if (!this.keys[path]) {
      if (this.type === 'HDPrivateKey') {
        this.keys[path] = this.generateKeyForPath(path, type);
      }
      if (this.type === 'privateKey') {
        this.keys[path] = this.getPrivateKey(path);
      }
    }

    return this.keys[path];
  }

  /**
   * Return a safier root path to derivate from
   *
   */
  getHardenedFeaturePath() {
    const pathRoot = (this.network.toString() === 'testnet') ? BIP44_TESTNET_ROOT_PATH : BIP44_LIVENET_ROOT_PATH;
    return this.generateKeyForPath(pathRoot);
  }

  /**
   * Generate a key by deriving it's direct child
   * @param index - {Number}
   * @return {HDPrivateKey | HDExtPublicKey}
   */
  getKeyForChild(index = 0, type = 'HDPrivateKey') {
    return this.generateKeyForChild(index, type);
  }

  /**
   * Allow to sign any transaction or a transition object from a valid privateKeys list
   * @param object
   * @param privateKeys
   * @param sigType
   */
  // eslint-disable-next-line class-methods-use-this
  sign(object, privateKeys, sigType = crypto.Signature.SIGHASH_ALL) {
    const handledTypes = [Transaction.name, Transaction.Payload.SubTxRegisterPayload];
    if (!privateKeys) throw new Error('Require one or multiple privateKeys to sign');
    if (!object) throw new Error('Nothing to sign');
    if (!handledTypes.includes(object.constructor.name)) {
      throw new Error(`Keychain sign : Unhandled object of type ${object.constructor.name}`);
    }
    const obj = object.sign(privateKeys, sigType);

    if (!obj.isFullySigned()) {
      throw new Error('Not fully signed transaction');
    }
    return obj;
  }
}

module.exports = KeyChain;
