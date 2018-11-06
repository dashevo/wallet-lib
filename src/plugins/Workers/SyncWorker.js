const _ = require('lodash');
const { Worker } = require('../');
const { ValidTransportLayerRequired } = require('../../errors');
const EVENTS = require('../../EVENTS');

const defaultOpts = {
  fetchThreshold: 10 * 60 * 1000,
  workerIntervalTime: 1 * 10 * 1000,
};

class SyncWorker extends Worker {
  constructor(opts = defaultOpts) {
    const params = Object.assign({
      executeOnStart: true,
      firstExecutionRequired: true,
      workerIntervalTime: defaultOpts.workerIntervalTime,
      fetchThreshold: defaultOpts.fetchThreshold,
      dependencies: [
        'storage', 'transport', 'fetchStatus', 'fetchAddressInfo', 'fetchTransactionInfo', 'walletId', 'getBalance',
      ],
    }, opts);
    super(params);
    this.isBIP44 = _.has(opts, 'isBIP44') ? opts.isBIP44 : true;

    this.listeners = {
      addresses: [],
    };
    this.bloomfilters = [];
  }

  async execDuringStart() {
    this.execStatusFetch();
  }

  async execute() {
    // Todo : Ensure the performance impact of this.
    // We would love to have a small perf footprint and this seems improvable.
    await this.execBlockListener();
    await this.execAddressFetching();
    await this.execAddressListener();
    await this.execTransactionsFetching();
    await this.execAddressBloomfilter();
  }

  async execStatusFetch() {
    try {
      const res = await this.fetchStatus();
      if (!res) {
        return false;
      }
      const { blocks } = res;
      this.storage.store.wallets[this.walletId].blockheight = blocks;
      this.events.emit(EVENTS.BLOCKHEIGHT_CHANGED);
      return true;
    } catch (e) {
      if (e instanceof ValidTransportLayerRequired) {
        console.log('invalid');
      }
      return e;
    }
  }

  async execBlockListener() {
    const self = this;
    const cb = async function (block) {
      self.storage.store.wallets[self.walletId].blockheight += 1;
      self.announce(EVENTS.BLOCK, block);
    };
    if (self.transport.isValid) {
      self.transport.subscribeToEvent(EVENTS.BLOCK, cb);
    }
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

    const getTransactionAndStore = async function (tx) {
      console.log(tx);
      if (tx.address && tx.txid) {
        console.log('TransactionINFO', tx);
        self.storage.addNewTxToAddress(tx, self.walletId);
        const transactionInfo = await self.transport.getTransaction(tx.txid);
        console.log('TransactionINFO', transactionInfo);
        self.storage.importTransactions(transactionInfo);
        console.log('TransactionINFO', transactionInfo);
        self.events.emit(EVENTS.BALANCE_CHANGED, { delta: transactionInfo.satoshis });
        self.events.emit(EVENTS.BALANCE_CHANGED, { delta: transactionInfo.satoshis });
      }
    };
    await self.transport.subscribeToAddresses(subscribedAddress, getTransactionAndStore);
    return true;
  }

  async execAddressFetching() {
    const self = this;
    const { addresses } = this.storage.getStore().wallets[this.walletId];
    const { fetchAddressInfo } = this;

    const toFetchAddresses = [];

    Object.keys(addresses).forEach((walletType) => {
      const walletAddresses = addresses[walletType];
      const walletPaths = Object.keys(walletAddresses);

      if (walletPaths.length > 0) {
        walletPaths.forEach((path) => {
          const address = walletAddresses[path];
          if (address.unconfirmedBalanceSat > 0
            || address.fetchedLast < Date.now() - self.fetchThreshold) {
            toFetchAddresses.push(address);
          }
        });
      }
    });
    const promises = [];

    toFetchAddresses.forEach((addressObj) => {
      const p = fetchAddressInfo(addressObj)
        .catch((e) => {
          if (e instanceof ValidTransportLayerRequired) return false;
          return e;
        });
      promises.push(p);
    });

    const responses = await Promise.all(promises);
    // console.log(responses)
    responses.forEach((addrInfo) => {
      try {
        // eslint-disable-next-line no-param-reassign
        if (!addrInfo.utxos) addrInfo.utxos = [];
        self.storage.updateAddress(addrInfo, self.walletId);
        if (addrInfo.balanceSat > 0) {
          self.events.emit(EVENTS.BALANCE_CHANGED, { delta: addrInfo.balanceSat });
        }
      } catch (e) {
        self.events.emit(EVENTS.ERROR_UPDATE_ADDRESS, e);
      }
    });
    this.events.emit(EVENTS.FETCHED_ADDRESS, responses);
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
            // In case we have a transaction associated to an address but unknown in global level
            if (!knownsTxId.includes(txid)) {
              toFetchTransactions.push(txid);
            } else if (transactions[txid].blockheight === -1) {
              toFetchTransactions.push(txid);
            } else if (blockheight - transactions[txid].blockheight < unconfirmedThreshold) {
              // When the txid is more than -1 but less than 6 conf.
              transactions[txid].spendable = false;
              self.storage.updateTransaction(transactions[txid]);
            } else if (transactions[txid].spendable === false) {
              transactions[txid].spendable = false;
              self.storage.updateTransaction(transactions[txid]);
            }
          });
        });
      }
    });

    const promises = [];

    toFetchTransactions.forEach((transactionObj) => {
      const p = fetchTransactionInfo(transactionObj)
        .then((transactionInfo) => {
          self.storage.importTransaction(transactionInfo);
          // todo : should fire only if really changed.
          // console.log(transactionInfo)
          // self.events.emit(EVENTS.BALANCE_CHANGED, {delta:transactionInfo.satoshis});
        });
      promises.push(p);
    });

    await Promise.all(promises);
    this.events.emit(EVENTS.FETCHED_TRANSACTIONS, promises);
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

  announce(type, el) {
    switch (type) {
      case EVENTS.BLOCK:
        this.events.emit(EVENTS.BLOCK);
        this.events.emit(EVENTS.BLOCKHEIGHT_CHANGED);
        break;
      default:
        console.warn('Not implemented, announce of ', type, el);
    }
  }
}
module.exports = SyncWorker;
