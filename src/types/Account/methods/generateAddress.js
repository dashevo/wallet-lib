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
  let keyData;
  const { network } = this;

  switch (this.walletType) {
    case WALLET_TYPES.ADDRESS:
      address = this.keyChainStore.getMasterKeyChain().rootKey;
      if (isWatchedAddress) {
        this.keyChainStore.issuedPaths.set(0, {
          path: 0,
          address,
          isUsed: false,
          isWatched: true,
        });
      }
      break;
    case WALLET_TYPES.PUBLICKEY:
      // eslint-disable-next-line no-case-declarations
      const { rootKey } = this.keyChainStore.getMasterKeyChain();
      address = rootKey.toAddress(network).toString();
      if (isWatchedAddress) {
        this.keyChainStore.issuedPaths.set(0, {
          key: rootKey,
          path: 0,
          address,
          isUsed: false,
          isWatched: true,
        });
      }
      break;
    case WALLET_TYPES.HDPRIVATE:
    case WALLET_TYPES.HDWALLET:
      // eslint-disable-next-line prefer-destructuring
      index = parseInt(path.toString().split('/')[5], 10);
      keyData = this.keyChainStore
        .getMasterKeyChain()
        .getForPath(path, { isWatched: isWatchedAddress });
      address = keyData.address;
      privateKey = keyData.key;
      break;
    case WALLET_TYPES.HDPUBLIC:
      index = parseInt(path.toString().split('/')[5], 10);
      // eslint-disable-next-line no-case-declarations
      keyData = this.keyChainStore
        .getMasterKeyChain()
        .getForPath(path, { isWatched: isWatchedAddress });
      privateKey = keyData.key;
      address = keyData.address;
      break;
      // TODO: DEPRECATE USAGE OF SINGLE_ADDRESS in favor or PRIVATEKEY
    case WALLET_TYPES.PRIVATEKEY:
    case WALLET_TYPES.SINGLE_ADDRESS:
      privateKey = this.keyChainStore.getMasterKeyChain().rootKey;
      address = privateKey.publicKey.toAddress(network).toString();

      if (isWatchedAddress) {
        this.keyChainStore
          .issuedPaths.set(0, {
            key: privateKey,
            path: 0,
            address,
            isUsed: false,
            isWatched: true,
          });
      }
      break;
    default:
      privateKey = this.keyChainStore
        .getMasterKeyChain()
        .getKeyForPath(path.toString(), { isWatched: isWatchedAddress }).key;
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
