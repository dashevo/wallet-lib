const { Worker } = require('../');
const { BIP44_ADDRESS_GAP } = require('../../CONSTANTS');

class BIP44Worker extends Worker {
  constructor() {
    super({
      firstExecutionRequired: true,
      executeOnStart: true,
      dependencies: [
        'storage', 'getAddress', 'walletId',
      ],
    });
  }

  execute() {
    const { addresses } = this.storage.store.wallets[this.walletId];
    const externalPaths = Object.keys(addresses.external);
    let externalUnused = 0;

    externalPaths.forEach((path) => {
      const el = addresses.external[path];
      if (el.transactions.length === 0) {
        externalUnused += 1;
      }
    });

    let externalMissingNb = 0;
    if (BIP44_ADDRESS_GAP > externalUnused) {
      externalMissingNb = BIP44_ADDRESS_GAP - externalUnused;
      const { external } = this.storage.store.wallets[this.walletId].addresses;
      const addressKeys = Object.keys(external);
      // console.log(addressKeys)
      const lastElem = external[addressKeys[addressKeys.length - 1]];
      // console.log(BIP44_ADDRESS_GAP, externalUnused, lastElem, addressKeys)

      const addressIndex = (!lastElem) ? -1 : parseInt(lastElem.index, 10);

      for (let i = addressIndex + 1; i < addressIndex + 1 + externalMissingNb; i += 1) {
        this.getAddress(i);
        this.getAddress(i, false);
      }
    }

    // Work as a verifier, will check that index are contiguous or create them
    const nonContinuousIndexes = this.getNonContinuousIndexes();
    nonContinuousIndexes.forEach((index) => {
      this.getAddress(index);
      this.getAddress(index, false);
    });
  }

  getNonContinuousIndexes(type = 'external') {
    const nonContinuousIndexes = [];
    const addresses = this.storage.getStore().wallets[this.walletId].addresses[type];
    const paths = Object.keys(addresses);
    if (paths.length > 0) {
      const basePath = paths[0].substring(0, paths[0].length - paths[0].split('/')[5].length);
      const totalNbAddresses = paths.length;
      for (let i = 0, foundAddresses = 0; i < 100 && foundAddresses < totalNbAddresses; i += 1) {
        const path = `${basePath}${i}`;
        if (!addresses[path]) {
          nonContinuousIndexes.push(i);
        }
        foundAddresses += 1;
      }
    }
    return nonContinuousIndexes;
  }
}
module.exports = BIP44Worker;
