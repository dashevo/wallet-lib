const { BIP44_ADDRESS_GAP } = require('../Constants');

class BIP44Worker {
  constructor(opts) {
    this.storage = opts.storage;
    this.getAddress = opts.getAddress;
    this.worker = null;
    this.workerPass = 0;
    this.workerRunning = false;
    this.workerIntervalTime = 1 * 60 * 1000;
  }

  execWorker() {
    if (this.workerRunning || this.workerPass > 42000) {
      return false;
    }
    this.workerRunning = true;
    const { addresses } = this.storage.store;
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
      const addressKeys = Object.keys(this.storage.store.addresses.external);
      const lastElem = this.storage.store.addresses.external[addressKeys[addressKeys.length - 1]];
      const addressIndex = (!lastElem) ? -1 : parseInt(lastElem.index, 10);

      for (let i = addressIndex + 1; i < addressIndex + 1 + externalMissingNb; i += 1) {
        this.getAddress(i);
        this.getAddress(i, false);
      }
    }
    this.workerRunning = false;
    this.workerPass += 1;
    return true;
  }

  startWorker() {
    const self = this;
    if (this.worker) this.stopWorker();
    // every minutes, check the pool
    this.worker = setInterval(self.execWorker.bind(self), this.workerIntervalTime);
    this.execWorker();
  }

  stopWorker() {
    clearInterval(this.worker);
    this.worker = null;
  }
}
module.exports = BIP44Worker;
