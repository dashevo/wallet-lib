const defaultOpts = {
  threesholdMs: 10 * 60 * 1000,
};
class SyncWorker {
  constructor(opts = defaultOpts) {
    this.events = opts.events;
    this.storage = opts.storage;
    this.transport = opts.transport;
    this.fetchStatus = opts.fetchStatus;
    this.fetchAddressInfo = opts.fetchAddressInfo;
    this.fetchTransactionInfo = opts.fetchTransactionInfo;
    this.walletId = opts.walletId;
    this.worker = null;
    this.workerPass = 0;
    this.workerRunning = false;
    this.workerIntervalTime = 1 * 10 * 1000;

    const fetchDiff = (opts.threesholdMs) ? opts.threesholdMs : defaultOpts.threesholdMs;
    this.fetchThreeshold = Date.now() - fetchDiff;

    this.listeners = {
      addresses: [],
    };
    this.bloomfilters = [];
  }

  async execAddressFetching() {
    const self = this;
    const { external, internal } = this.storage.getStore().wallets[this.walletId].addresses;
    const { fetchAddressInfo } = this;
    const externalPaths = Object.keys(external);
    const internalPaths = Object.keys(internal);

    const toFetchAddresses = [];

    if (externalPaths.length > 0) {
      externalPaths.forEach((path) => {
        const el = external[path];
        if (el.unconfirmedBalanceSat > 0 || el.fetchedLast < self.fetchThreeshold) {
          toFetchAddresses.push(el);
        }
      });
    }
    if (internalPaths.length > 0) {
      internalPaths.forEach((path) => {
        const el = internal[path];
        if (el.unconfirmedBalanceSat > 0 || el.fetchedLast < self.fetchThreeshold) {
          toFetchAddresses.push(el);
        }
      });
    }
    const promises = [];

    toFetchAddresses.forEach((addressObj) => {
      const p = fetchAddressInfo(addressObj)
        .then((addrInfo) => {
          self.storage.updateAddress(addrInfo, self.walletId);
          self.events.emit('balance_changed');
        });
      promises.push(p);
    });

    await Promise.all(promises);

    this.events.emit('fetched/address');
    return true;
  }

  async execBlockListener() {
    const self = this;
    const cb = async function (block) {
      self.storage.store.wallets[self.walletId].blockheight += 1;
      console.log('A new block', block, self.storage.store.wallets[self.walletId].blockheight);
      self.events.emit('blockheight_changed');
      // if (tx.address && tx.txid) {
      //   self.storage.addNewTxToAddress(tx, self.walletId);
      //   const transactionInfo = await self.transport.getTransaction(tx.txid);
      //   self.storage.importTransactions(transactionInfo);
      //   self.events.emit('balance_changed');
      // }
    };
    await self.transport.subscribeToEvent('block', cb);
  }

  async execAddressListener() {
    const self = this;
    const listenerAddresses = [];
    this.listeners.addresses.filter(listener => listenerAddresses.push(listener.address));
    const toPushListener = [];

    const { external, internal } = this.storage.store.wallets[this.walletId].addresses;
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
    toPushListener.forEach((listener) => {
      const listenerObj = Object.assign({}, listener);
      listenerObj.cb = function (event) {
        console.log('Event:', event, listenerObj.address);
      };

      this.listeners.addresses.push(listener);
      // self.transport.subscribeToAddress(listener.address, cb.bind({ listener }));
    });
    const subscribedAddress = this.listeners.addresses.reduce((acc, el) => {
      acc.push(el.address);
      return acc;
    }, []);

    const cb = async function (tx) {
      if (tx.address && tx.txid) {
        self.storage.addNewTxToAddress(tx, self.walletId);
        const transactionInfo = await self.transport.getTransaction(tx.txid);
        self.storage.importTransactions(transactionInfo);
        self.events.emit('balance_changed');
      }
    };
    await self.transport.subscribeToAddresses(subscribedAddress, cb);
    return true;
  }

  async execTransactionsFetching() {
    const self = this;
    const { transactions, wallets } = this.storage.getStore();
    const { blockheight, addresses } = wallets[this.walletId];
    const { external, internal } = addresses;
    const { fetchTransactionInfo } = this;
    const externalPaths = Object.keys(external);
    const internalPaths = Object.keys(internal);

    const toFetchTransactions = [];
    const unconfirmedThreshold = 6;

    // Parse all addresses and will check if some transaction need to be fetch.
    // This could happen if a tx is yet unconfirmed or if unknown yet.

    if (externalPaths.length > 0) {
      externalPaths.forEach((path) => {
        const el = external[path];
        const knownsTxId = Object.keys(transactions);
        el.transactions.forEach((txid) => {
          const txBlockheight = transactions[txid].blockheight;
          if (!knownsTxId.includes(txid) || txBlockheight === -1) {
            toFetchTransactions.push(txid);
          } else if (blockheight - txBlockheight < unconfirmedThreshold) {
            console.log(blockheight, txBlockheight, unconfirmedThreshold, blockheight - txBlockheight);
          }
        });
      });
    }
    if (internalPaths.length > 0) {
      internalPaths.forEach((path) => {
        const el = internal[path];
        const knownsTxId = Object.keys(self.storage.store.transactions);
        el.transactions.forEach((txid) => {
          const txBlockheight = transactions[txid].blockheight;
          if (!knownsTxId.includes(txid) || txBlockheight === -1) {
            toFetchTransactions.push(txid);
          } else if (blockheight - txBlockheight < unconfirmedThreshold) {
            console.log(blockheight, txBlockheight, unconfirmedThreshold, blockheight - txBlockheight);
          }
        });
      });
    }

    const promises = [];

    toFetchTransactions.forEach((transactionObj) => {
      const p = fetchTransactionInfo(transactionObj)
        .then((transactionInfo) => {
          self.storage.updateTransaction(transactionInfo);
          self.events.emit('balance_changed');
        });
      promises.push(p);
    });

    await Promise.all(promises);
    this.events.emit('fetched/transactions');
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

    await this.execBlockListener();
    await this.execAddressFetching();
    await this.execAddressListener();
    await this.execTransactionsFetching();
    await this.execAddressBloomfilter();

    this.workerRunning = false;
    this.workerPass += 1;
    this.events.emit('WORKER/SYNC/EXECUTED');
    return true;
  }

  async execInitialFetch() {
    const res = await this.fetchStatus();
    const { blocks } = res;
    this.storage.store.wallets[this.walletId].blockheight = blocks;
    this.events.emit('blockheight_changed');
    return true;
  }

  startWorker() {
    const self = this;
    if (this.worker) this.stopWorker();
    this.execInitialFetch();
    // every minutes, check the pool
    this.worker = setInterval(self.execWorker.bind(self), this.workerIntervalTime);
    setTimeout(self.execWorker.bind(self), 3000);
    this.events.emit('WORKER/SYNC/STARTED');
  }

  stopWorker() {
    clearInterval(this.worker);
    this.worker = null;
  }
}
module.exports = SyncWorker;
