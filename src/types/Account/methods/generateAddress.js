const EVENTS = require('../../../EVENTS');
const { WALLET_TYPES } = require('../../../CONSTANTS');
const { is } = require('../../../utils');

/**
 * Generate an address from a path and import it to the store
 * @param {string} path
 * @param {boolean} [isWatchedAddress=true] - if the address will be watched
 * @return {AddressObj} Address information
 * */
function generateAddress(path, isWatchedAddress = true) {
  if (is.undefOrNull(path)) throw new Error('Expected path to generate an address');
  let index = 0;
  let privateKey;
  let address;
  const { network } = this;

  switch (this.walletType) {
    case WALLET_TYPES.ADDRESS:
      address = this.keyChainStore.getWalletKeyChain().rootKey;
      break;
    case WALLET_TYPES.PUBLICKEY:
      address = this.keyChainStore.getWalletKeyChain().rootKey.toAddress(network).toString();
      if (isWatchedAddress) {
        this.keyChainStore.getWalletKeyChain()
          .addKeysToWatchedKeys(this.keyChainStore.getWalletKeyChain().rootKey);
      }
      break;
    case WALLET_TYPES.HDWALLET:
      // eslint-disable-next-line prefer-destructuring
      index = parseInt(path.toString().split('/')[5], 10);
      privateKey = this.keyChainStore.getWalletKeyChain().getKeyForPath(path);
      if (isWatchedAddress) {
        this.keyChainStore.getWalletKeyChain().addKeysToWatchedKeys(privateKey);
      }
      address = privateKey.publicKey.toAddress(network).toString();
      break;
    case WALLET_TYPES.HDPUBLIC:
      index = parseInt(path.toString().split('/')[5], 10);
      privateKey = this.keyChainStore.getWalletKeyChain().getKeyForPath(index);
      if (isWatchedAddress) {
        this.keyChainStore.getWalletKeyChain().addKeysToWatchedKeys(privateKey);
      }
      address = privateKey.publicKey.toAddress(network).toString();
      break;
      // TODO: DEPRECATE USAGE OF SINGLE_ADDRESS in favor or PRIVATEKEY
    case WALLET_TYPES.PRIVATEKEY:
    case WALLET_TYPES.SINGLE_ADDRESS:
      privateKey = this.keyChainStore.getWalletKeyChain().rootKey;
      if (isWatchedAddress) {
        this.keyChainStore.getWalletKeyChain().addKeysToWatchedKeys(privateKey);
      }
      address = privateKey.publicKey.toAddress(network).toString();
      break;
    default:
      privateKey = this.keyChainStore.getWalletKeyChain().getKeyForPath(path.toString());
      if (isWatchedAddress) {
        this.keyChainStore.getWalletKeyChain().addKeysToWatchedKeys(privateKey);
      }
      address = privateKey.publicKey.toAddress(network).toString();
  }

  const addressData = {
    path: path.toString(),
    index,
    address,
    // privateKey,
    transactions: [],
    balanceSat: 0,
    unconfirmedBalanceSat: 0,
    utxos: {},
    fetchedLast: 0,
    used: false,
  };

  this.storage.importAddresses(addressData, this.walletId);
  this.emit(EVENTS.GENERATED_ADDRESS, { type: EVENTS.GENERATED_ADDRESS, payload: addressData });
  return addressData;
}

module.exports = generateAddress;
