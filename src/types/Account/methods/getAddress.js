const { WALLET_TYPES } = require('../../../CONSTANTS');

const getTypePathFromWalletType = (walletType, addressType = 'external', accountIndex, addressIndex) => {
  let type;
  let path;

  const addressTypeIndex = (addressType === 'external') ? 0 : 1;
  switch (walletType) {
    case WALLET_TYPES.HDWALLET:
      type = addressType;
      path = `m/${addressTypeIndex}/${addressIndex}`;
      break;
    case WALLET_TYPES.HDPUBLIC:
      type = 'external';
      path = `m/${addressTypeIndex}/${addressIndex}`;
      break;
    case WALLET_TYPES.PUBLICKEY:
    case WALLET_TYPES.ADDRESS:
    case WALLET_TYPES.PRIVATEKEY:
    case WALLET_TYPES.SINGLE_ADDRESS:
    default:
      type = 'misc';
      path = '0';
  }
  return { type, path };
};
/**
 * Get a specific addresss based on the index and type of address.
 * @param {number} index - The index on the type
 * @param {AddressType} [_type="external"] - Type of the address (external, internal, misc)
 * @return <AddressInfo>
 */
function getAddress(addressIndex = 0, _type = 'external') {
  const accountIndex = this.index;
  const { type, path } = getTypePathFromWalletType(this.walletType, _type, accountIndex, addressIndex);

  const { wallets } = this.storage.getStore();
  const matchingTypeAddresses = wallets[this.walletId].addresses[type];
  return (matchingTypeAddresses[path]) ? matchingTypeAddresses[path] : this.generateAddress(path);
}
module.exports = getAddress;
