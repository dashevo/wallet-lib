const { BIP44_ADDRESS_GAP, WALLET_TYPES } = require('../../../CONSTANTS');
const is = require('../../../utils/is');

const getMissingIndexes = require('../../../plugins/Workers/BIP44Worker/utils/getMissingIndexes');
const isContiguousPath = require('../../../plugins/Workers/BIP44Worker/utils/isContiguousPath');

/**
 *
 * @param {Storage} store
 * @param walletType
 * @param walletId
 * @param accountIndex
 * @param getAddress
 * @return {number}
 */
function fillAddressesToGapLimit(store, walletType, walletId, accountIndex, getAddress) {
  let generated = 0;
  let unusedAddress = 0;
  const addresses = store.wallets[walletId].addresses.external;
  let addressesPaths = Object.keys(addresses);

  let prevPath;

  // Ensure that all our above paths are contiguous
  const missingIndexes = getMissingIndexes(addressesPaths);

  // Gets missing addresses and adds them to the storage
  // Please note that getAddress adds new addresses to storage, which it probably shouldn't
  missingIndexes.forEach((index) => {
    getAddress(index, 'external');
    if (walletType === WALLET_TYPES.HDWALLET) {
      getAddress(index, 'internal');
    }
  });

  const sortByIndex = (a, b) => parseInt(a.split('/')[5], 10) - parseInt(b.split('/')[5], 10);
  addressesPaths = Object
    .keys(store.wallets[walletId].addresses.external)
    .filter((el) => parseInt(el.split('/')[3], 10) === accountIndex)
    .sort(sortByIndex);

  // Scan already generated addresse and count how many are unused
  addressesPaths.forEach((path) => {
    const el = addresses[path];
    if (!el.used && el.path.length > 0) {
      el.used = true;
      throw new Error(`Conflicting information ${JSON.stringify(el)}`);
    }
    if (!el.used) unusedAddress += 1;
    if (!isContiguousPath(path, prevPath)) {
      throw new Error('Addresses are expected to be contiguous');
    }
    prevPath = path;
  });

  // Unused addresses are counted in the foreach above
  const addressToGenerate = BIP44_ADDRESS_GAP - unusedAddress;
  if (addressToGenerate > 0) {
    const lastElemPath = addressesPaths[addressesPaths.length - 1];
    const lastElem = addresses[lastElemPath];

    const startingIndex = (is.def(lastElem)) ? lastElem.index + 1 : 0;
    const lastIndex = addressToGenerate + startingIndex;
    if (lastIndex > startingIndex) {
      for (let i = startingIndex; i <= lastIndex; i += 1) {
        getAddress(i, 'external');
        generated += 1;
        if (walletType === WALLET_TYPES.HDWALLET) {
          getAddress(i, 'internal');
        }
      }
    }
  }

  return generated;
}

module.exports = fillAddressesToGapLimit;
