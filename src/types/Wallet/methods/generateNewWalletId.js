const { mnemonicToWalletId } = require('../../../utils');
const { WALLET_TYPES } = require('../../../CONSTANTS');

/**
 * Generate a wallet id for a specific wallet based on it's (HD)privateKey
 * @return walletId
 */
module.exports = function generateNewWalletId() {
  const { walletType } = this;
  const errorMessageBase = 'Cannot generate a walletId';
  switch (walletType) {
    case WALLET_TYPES.ADDRESS:
      if (!this.address) throw new Error(`${errorMessageBase} : No address found`);
      this.walletId = mnemonicToWalletId(this.address);
      break;
    case WALLET_TYPES.PUBLICKEY:
      if (!this.publicKey) throw new Error(`${errorMessageBase} : No publicKey found`);
      this.walletId = mnemonicToWalletId(this.publicKey);
      break;
    // TODO: DEPRECATE USAGE OF SINGLE_ADDRESS in favor or PRIVATEKEY
    case WALLET_TYPES.PRIVATEKEY:
    case WALLET_TYPES.SINGLE_ADDRESS:
      if (!this.privateKey) throw new Error(`${errorMessageBase} : No privateKey found`);
      this.walletId = mnemonicToWalletId(this.privateKey);
      break;
    case WALLET_TYPES.HDPUBLIC:
      if (!this.HDPublicKey) throw new Error(`${errorMessageBase} : No HDPublicKey found`);
      this.walletId = mnemonicToWalletId(this.HDPublicKey);
      break;
    case WALLET_TYPES.HDWALLET:
    default:
      if (!this.HDPrivateKey) throw new Error(`${errorMessageBase} : No HDPrivateKey found`);
      this.walletId = mnemonicToWalletId(this.HDPrivateKey);
      break;
  }
  return this.walletId;
};
