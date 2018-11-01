const { Worker } = require('../');

const defaultOpts = {
  workerIntervalTime: 1 * 10 * 1000,
};
class SingleSyncWorker extends Worker {
  constructor(opts = defaultOpts) {
    const params = Object.assign({
      executeOnStart: true,
      firstExecutionRequired: true,
      workerIntervalTime: defaultOpts.workerIntervalTime,
      dependencies: [
        'storage', 'transport', 'fetchStatus', 'fetchAddressInfo', 'fetchTransactionInfo', 'walletId'
      ]
    }, opts);
    super(params);

    this.listeners = {
      addresses: [],
    };
    this.bloomfilters = [];
  }

  async execDuringStart(){
    this.execStatusFetch();
  }
  async execAddressFetching() {
    const self = this;
    const { addresses } = this.storage.getStore().wallets[this.walletId];
    const address = (addresses.misc['0'] && addresses.misc['0'].address) || null;
    if (!address || address.unconfirmedBalanceSat > 0 || address.fetchedLast < self.fetchThreeshold) {
      const addrInfo = await this.fetchAddressInfo();
      console.log(addrInfo)
      self.storage.updateAddress(addrInfo, self.walletId);
    }
    self.events.emit('balance_changed');
    this.events.emit('fetched/address');
    return true;
  }


  async execAddressListener() {
    const self = this;
    const listenerAddresses = [];
    this.listeners.addresses.filter(listener => listenerAddresses.push(listener.address));
    const toPushListener = [];

    const { addresses } = this.storage.getStore().wallets[this.walletId];

    Object.keys(addresses).forEach((walletType) => {
      const walletAddresses = addresses[walletType];
      const walletPaths = Object.keys(walletAddresses);
      if (walletPaths.length > 0) {
        walletPaths.forEach((path) => {
          const address = walletAddresses[path];
          if (!listenerAddresses.includes(address.address)) {
            const listener = {
              address: address.address,
            };
            toPushListener.push(listener);
          }
        });
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
    const { fetchTransactionInfo } = this;

    const toFetchTransactions = [];
    const unconfirmedThreshold = 6;

    // Parse all addresses and will check if some transaction need to be fetch.
    // This could happen if a tx is yet unconfirmed or if unknown yet.

    Object.keys(addresses).forEach((walletType) => {
      const walletAddresses = addresses[walletType];
      const walletPaths = Object.keys(walletAddresses);
      if (walletPaths.length > 0) {
        walletPaths.forEach((path) => {
          const address = walletAddresses[path];
          const knownsTxId = Object.keys(transactions);
          address.transactions.forEach((txid) => {
            const tx = transactions[txid];
            // In case we have a transaction associated to an address but unknown in global level
            if (!knownsTxId.includes(txid)) {
              toFetchTransactions.push(txid);
            } else if (tx.blockheight === -1) {
              toFetchTransactions.push(txid);
            } else if (tx.blockheight - tx.blockheight < unconfirmedThreshold) {
              // When the txid is more than -1 but less than 6 conf.
              tx.spendable = false;
              self.storage.updateTransaction(tx);
            } else if (tx.spendable === false) {
              tx.spendable = false;
              self.storage.updateTransaction(tx);
            }
          });
        });
      }
    });

    const promises = [];

    toFetchTransactions.forEach((transactionObj) => {
      const p = fetchTransactionInfo(transactionObj)
        .then((transactionInfo) => {
          self.storage.updateTransaction(transactionInfo);
          // todo : should fire only if really changed.
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

    // Todo : Ensure the performance impact of this.
    // We would love to have a small perf footprint and this seems improvable.
    await this.execBlockListener();
    await this.execAddressFetching();
    // await this.execAddressListener();
    await this.execTransactionsFetching();
    // await this.execAddressBloomfilter();

    this.workerRunning = false;
    this.workerPass += 1;
    this.events.emit('WORKER/SINGLESYNC/EXECUTED');
    return true;
  }

}
module.exports = SingleSyncWorker;
