const { WALLET_TYPES } = require('../../../CONSTANTS');

function exportMnemonic(mnemonic) {
  if (!mnemonic) throw new Error('Wallet was not initiated with a mnemonic, can\'t export it');
  return mnemonic.toString();
}

function exportPublicKeyWallet(_outputType = 'publicKey') {
  switch (_outputType) {
    case 'publicKey':
      if (!this.publicKey) throw new Error('No PublicKey to export');
      return this.publicKey;
    default:
      throw new Error(`Tried to export to invalid output : ${_outputType}`);
  }
}

function exportAddressWallet(_outputType = 'address') {
  switch (_outputType) {
    case 'address':
      if (!this.address) throw new Error('No Address to export');
      return this.address;
    default:
      throw new Error(`Tried to export to invalid output : ${_outputType}`);
  }
}

function exportSingleAddressWallet(_outputType = 'privateKey') {
  switch (_outputType) {
    case 'privateKey':
      if (!this.privateKey) throw new Error('No PrivateKey to export');
      return this.privateKey;
    default:
      throw new Error(`Tried to export to invalid output : ${_outputType}`);
  }
}

function exportHDWallet(_outputType) {
  switch (_outputType) {
    case undefined:
      // We did not define any output, so we try first mnemonic, or HDPrivateKey
      try {
        return exportHDWallet.call(this, 'mnemonic');
      } catch (e) {
        return exportHDWallet.call(this, 'HDPrivateKey');
      }
    case 'mnemonic':
      if (!this.mnemonic) throw new Error('Wallet was not initiated with a mnemonic, can\'t export it.');
      return exportMnemonic(this.mnemonic);
    case 'HDPrivateKey':
      if (!this.HDPrivateKey) throw new Error('No PrivateKey to export');
      return this.HDPrivateKey.toString();
    default:
      throw new Error(`Tried to export to invalid output : ${_outputType}`);
  }
}

function exportHDPublicWallet(_outputType = 'HDPublicKey') {
  switch (_outputType) {
    case 'HDPublicKey':
      if (!this.HDPublicKey) throw new Error('No publicKey to export');
      return this.HDPublicKey.toString();
    default:
      throw new Error(`Tried to export to invalid output : ${_outputType}`);
  }
}

/**
 * Allow to export the wallet (mnemonic).
 * The default output differs from the wallet type.
 * For an HDWallet, it will be it's mnemonic.
 * For an HDPublic wallet (watch), it's will be that HDPubKey.
 * If initiated from a private key, we output that key, similarly
 * if initiated from a public key.
 * On the case it's initiated from an address, we output it.
 *
 * @param outputType - Allow to overwrite the default output type
 * @return {Mnemonic|HDPrivateKey}
 */
module.exports = function exportWallet(outputType) {
  switch (this.walletType) {
    case WALLET_TYPES.PRIVATEKEY:
    case WALLET_TYPES.SINGLE_ADDRESS:
      return exportSingleAddressWallet.call(this, outputType);
    case WALLET_TYPES.ADDRESS:
      return exportAddressWallet.call(this, outputType);
    case WALLET_TYPES.PUBLICKEY:
      return exportPublicKeyWallet.call(this, outputType);
    case WALLET_TYPES.HDPUBLIC:
      return exportHDPublicWallet.call(this, outputType);
    case WALLET_TYPES.HDWALLET:
      return exportHDWallet.call(this, outputType);
    default:
      throw new Error('Trying to export from an unknown wallet type');
  }
};
