const defaultOpts = {
  threesholdMs: 10 * 60 * 1000,
};
class SyncWorker {
  constructor(opts = defaultOpts) {
    this.events = opts.events;
    this.storage = opts.storage;
    this.transport = opts.transport;
    this.fetchAddressInfo = opts.fetchAddressInfo;
    this.worker = null;
    this.workerPass = 0;
    this.workerRunning = false;
    this.workerIntervalTime = 1 * 60 * 1000;


    const fetchDiff = (opts.threesholdMs) ? opts.threesholdMs : defaultOpts.threesholdMs;
    this.fetchThreeshold = Date.now() - fetchDiff;

    this.listeners = [];
    this.bloomfilters = [];
  }

  async execAddressFetching() {
    const self = this;
    const { external, internal } = this.storage.getStore().addresses;
    const { fetchAddressInfo } = this;
    const externalPaths = Object.keys(external);
    const internalPaths = Object.keys(internal);

    const toFetchAddresses = [];

    if (externalPaths.length > 0) {
      externalPaths.forEach((path) => {
        const el = external[path];
        if (el.fetchedLast < self.fetchThreeshold) {
          toFetchAddresses.push(el);
        }
      });
    }
    if (internalPaths.length > 0) {
      internalPaths.forEach((path) => {
        const el = internal[path];
        if (el.fetchedLast < self.fetchThreeshold) {
          toFetchAddresses.push(el);
        }
      });
    }

    toFetchAddresses.forEach((addressObj) => {
      fetchAddressInfo(addressObj)
        .then((addrInfo) => {
          self.storage.updateAddress(addrInfo);
        });
    });

    this.events.emit('fetched/address');
    return true;
  }

  async execAddressListener() {
    const self = this;
    const listenerAddresses = [];
    this.listeners.filter(listener => listenerAddresses.push(listener.address));
    const toPushListener = [];

    const { external, internal } = this.storage.store.addresses;
    const externalPaths = Object.keys(external);
    const internalPaths = Object.keys(internal);

    externalPaths.forEach((path) => {
      const el = external[path];
      if (!listenerAddresses.includes(el.address)) {
        const listener = {
          address: el.address,
        };
        toPushListener.push(listener);
      }
    });

    internalPaths.forEach((path) => {
      const el = internal[path];
      if (!listenerAddresses.includes(el.address)) {
        const listener = {
          address: el.address,
        };
        toPushListener.push(listener);
      }
    });

    const cb = function cb(data) {
      const { listener } = this;
      const { address, txid } = (data);

      console.log(address, 'a check', listener, 'txid', txid);
    };
    toPushListener.forEach((listener) => {
      this.listeners.push(listener);
      self.transport.subscribeToAddress(listener.address, cb.bind({ listener }));
    });

    return true;
  }

  async execAddressBloomfilter() {
    const bloomfilterAddresses = [];
    this.bloomfilters.filter(bloom => bloomfilterAddresses.push(bloom.address));
    const toPushBloom = [];

    toPushBloom.forEach((bloom) => {
      this.bloomfilters.push(bloom);
    });
    return true;
  }

  async execWorker() {
    if (this.workerRunning || this.workerPass > 42000) {
      return false;
    }
    this.workerRunning = true;

    await this.execAddressFetching();
    await this.execAddressListener();
    await this.execAddressBloomfilter();

    this.workerRunning = false;
    this.workerPass += 1;
    return true;
  }

  startWorker() {
    const self = this;
    if (this.worker) this.stopWorker();
    // every minutes, check the pool
    this.worker = setInterval(self.execWorker.bind(self), this.workerIntervalTime);
    setTimeout(self.execWorker.bind(self), 800);
  }

  stopWorker() {
    clearInterval(this.worker);
    this.worker = null;
  }
}
module.exports = SyncWorker;
