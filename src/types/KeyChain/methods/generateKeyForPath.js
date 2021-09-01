const {
  HDPublicKey,
  HDPrivateKey,
  PrivateKey,
} = require('@dashevo/dashcore-lib');
const { WALLET_TYPES } = require('../../../CONSTANTS');
/**
 * Derive from HDPrivateKey to a specific path
 * @param {string} path
 * @param {HDPrivateKey|HDPublicKey} [type=HDPrivateKey] - set the type of returned keys
 * @param {Boolean} unsafeDerivateFromInvalidType[=false] - force unsafe derivation from invalid key type used as seed
 * @return {HDPrivateKey|HDPublicKey}
 */
function generateKeyForPath(path, type = 'HDPrivateKey', unsafeDerivateFromInvalidType = false) {
  let HDKey;
  if (!['HDPrivateKey', 'HDPublicKey'].includes(this.type)) {
    if (unsafeDerivateFromInvalidType && this.type === WALLET_TYPES.PRIVATEKEY) {
      HDKey = HDPrivateKey.fromSeed(new PrivateKey(this.privateKey).toBuffer(), this.network);
    } else {
      throw new Error('Wallet is not loaded from a mnemonic or a HDPubKey, impossible to derivate keys');
    }
  } else {
    HDKey = this[this.type];
  }
  const hdPrivateKey = HDKey.derive(path);
  if (type === 'HDPublicKey') return HDPublicKey(hdPrivateKey);
  return hdPrivateKey;
}
module.exports = generateKeyForPath;
