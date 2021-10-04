const logger = require('../../logger');
const { BIP44_ADDRESS_GAP } = require('../../CONSTANTS');
const is = require('../is');

const getMissingIndexes = require('./getMissingIndexes');
const isContiguousPath = require('./isContiguousPath');

const sortByIndex = (a, b) => parseInt(a.split('/')[5], 10) - parseInt(b.split('/')[5], 10);

/**
 * This method ensures there will always be enough local addresses up to gap limit as per BIP44
 * @param {Storage} walletStore
 * @param walletType
 * @param accountIndex
 * @param getAddress
 * @return {number}
 */
function ensureAccountAddressesToGapLimit(walletStore, walletType, accountIndex, getAddress) {
  let generated = 0;

  const {
    external: externalAddresses,
    internal: internalAddresses,
  } = walletStore.addresses;

  let prevExternalPath;
  let prevInternalPath;

  // Gets missing addresses and adds them to the storage
  // Please note that getAddress adds new addresses to storage, which it probably shouldn't

  let externalAddressesPaths = Object.keys(externalAddresses);
  // Ensure that all our paths are contiguous
  const missingExternalIndexes = getMissingIndexes(externalAddressesPaths);
  missingExternalIndexes.forEach((externalIndex) => {
    getAddress(externalIndex, 'external');
  });

  let internalAddressesPaths = Object.keys(internalAddresses);
  const missingInternalIndexes = getMissingIndexes(internalAddressesPaths);
  missingInternalIndexes.forEach((internalIndex) => {
    getAddress(internalIndex, 'internal');
  });

  externalAddressesPaths = Object
    .keys(externalAddresses)
    .filter((el) => parseInt(el.split('/')[3], 10) === accountIndex)
    .sort(sortByIndex);

  internalAddressesPaths = Object
    .keys(internalAddresses)
    .filter((el) => parseInt(el.split('/')[3], 10) === accountIndex)
    .sort(sortByIndex);

  const lastUsedIndexes = {
    external: 0,
    internal: 0,
  };
  const lastGeneratedIndexes = {
    external: 0,
    internal: 0,
  };

  // Scan already generated addresses and count how many are unused
  externalAddressesPaths.forEach((path) => {
    const address = externalAddresses[path];

    if (!isContiguousPath(path, prevExternalPath)) {
      throw new Error('Addresses are expected to be contiguous');
    }

    if (address.used) {
      lastUsedIndexes.external = address.index;
    }

    lastGeneratedIndexes.external = address.index;
    prevExternalPath = path;
  });

  internalAddressesPaths.forEach((path) => {
    const address = internalAddresses[path];

    if (!isContiguousPath(path, prevInternalPath)) {
      throw new Error('Addresses are expected to be contiguous');
    }

    if (address.used) {
      lastUsedIndexes.internal = address.index;
    }

    lastGeneratedIndexes.internal = address.index;
    prevInternalPath = path;
  });

  const gapBetweenLastUsedAndLastGenerated = {
    external: lastGeneratedIndexes.external - lastUsedIndexes.external,
    internal: lastGeneratedIndexes.internal - lastUsedIndexes.internal,
  };
  const addressesToGenerate = {
    external: BIP44_ADDRESS_GAP - gapBetweenLastUsedAndLastGenerated.external,
    internal: BIP44_ADDRESS_GAP - gapBetweenLastUsedAndLastGenerated.internal,
  };
  if (addressesToGenerate.external > 0) {
    const lastExternalElemPath = externalAddressesPaths[externalAddressesPaths.length - 1];
    const lastExternalElem = externalAddresses[lastExternalElemPath];
    const lastExternalExistingIndex = (is.def(lastExternalElem)) ? lastExternalElem.index : -1;
    const lastExternalIndexToGenerate = lastExternalExistingIndex + addressesToGenerate.external;
    if (lastExternalIndexToGenerate > lastExternalExistingIndex) {
      for (
        let externalIndex = lastExternalExistingIndex + 1;
        externalIndex <= lastExternalIndexToGenerate;
        externalIndex += 1) {
        getAddress(externalIndex, 'external');
        generated += 1;
      }
    }
  }
  if (addressesToGenerate.internal > 0) {
    const lastInternalElemPath = internalAddressesPaths[internalAddressesPaths.length - 1];
    const lastInternalElem = internalAddresses[lastInternalElemPath];
    const lastInternalExistingIndex = (is.def(lastInternalElem)) ? lastInternalElem.index : -1;
    const lastInternalIndexToGenerate = lastInternalExistingIndex + addressesToGenerate.internal;
    if (lastInternalIndexToGenerate > lastInternalExistingIndex) {
      for (
        let internalIndex = lastInternalExistingIndex + 1;
        internalIndex <= lastInternalIndexToGenerate;
        internalIndex += 1) {
        getAddress(internalIndex, 'internal');
        generated += 1;
      }
    }
  }
  logger.silly(`BIP44 - ensured addresses to gap limit - generated: ${generated}`);
  return generated;
}

module.exports = ensureAccountAddressesToGapLimit;
