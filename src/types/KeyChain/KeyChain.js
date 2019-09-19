const { Networks } = require('@dashevo/dashcore-lib');
const { has } = require('lodash');

// eslint-disable-next-line no-underscore-dangle
const _defaultOpts = {
  network: Networks.testnet.toString(),
  keys: {},
};

class KeyChain {
  constructor(opts = JSON.parse(JSON.stringify(_defaultOpts))) {
    const defaultOpts = JSON.parse(JSON.stringify(_defaultOpts));
    this.network = defaultOpts.network;
    this.keys = { ...defaultOpts.keys };

    if (has(opts, 'HDPrivateKey')) {
      this.type = 'HDPrivateKey';
      this.HDPrivateKey = opts.HDPrivateKey;
      this.network = this.HDPrivateKey.network;
    } else if (has(opts, 'HDPublicKey')) {
      this.type = 'HDPublicKey';
      this.HDPublicKey = opts.HDPublicKey;
      this.network = this.HDPublicKey.network;
    } else if (has(opts, 'privateKey')) {
      this.type = 'privateKey';
      this.privateKey = opts.privateKey;
    } else {
      throw new Error('Expect privateKey, HDPublicKey or HDPrivateKey');
    }
    if (opts.network) this.network = opts.network;
    if (opts.keys) this.keys = { ...opts.keys };
  }
}

KeyChain.prototype.generateKeyForChild = require('./methods/generateKeyForChild');
KeyChain.prototype.generateKeyForPath = require('./methods/generateKeyForPath');
KeyChain.prototype.getHardenedFeaturePath = require('./methods/getHardenedFeaturePath');
KeyChain.prototype.getKeyForChild = require('./methods/getKeyForChild');
KeyChain.prototype.getKeyForPath = require('./methods/getKeyForPath');
KeyChain.prototype.getPrivateKey = require('./methods/getPrivateKey');
KeyChain.prototype.sign = require('./methods/sign');
KeyChain.prototype.updateNetwork = require('./methods/updateNetwork');

module.exports = KeyChain;
