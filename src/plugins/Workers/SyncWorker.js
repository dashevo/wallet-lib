const _ = require('lodash');
const { Worker } = require('../');
const { ValidTransportLayerRequired, InvalidTransaction } = require('../../errors');
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

  async execute() {
    // Todo : Ensure the performance impact of this.
    // We would love to have a small perf footprint and this seems improvable.
    await this.execAddressFetching();

    await this.execAddressListener();

    await this.execTransactionsFetching();

    await this.execAddressBloomfilter();
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
      if (tx.address && tx.txid) {
        self.storage.addNewTxToAddress(tx, self.walletId);
        const transactionInfo = await self.transport.getTransaction(tx.txid);
        self.storage.importTransactions(transactionInfo);
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
          throw e;
        });
      promises.push(p);
    });

    const responses = await Promise.all(promises);
    responses.forEach((addrInfo) => {
      try {
        const prev = self.storage.searchAddress(addrInfo.address);
        if (prev.found && !addrInfo.utxos) {
          // eslint-disable-next-line no-param-reassign
          addrInfo.utxos = prev.result.utxos;
        }
        self.storage.updateAddress(addrInfo, self.walletId);
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
        }).catch((e) => {
          if (e instanceof ValidTransportLayerRequired) return false;
          if (e instanceof InvalidTransaction) return false;
          throw e;
        });
      promises.push(p);
    });

    const resolvedPromised = await Promise.all(promises);
    this.events.emit(EVENTS.FETCHED_TRANSACTIONS, resolvedPromised);
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
        this.events.emit(EVENTS.BLOCK, el);
        break;
      case EVENTS.BLOCKHEIGHT_CHANGED:
        this.events.emit(EVENTS.BLOCKHEIGHT_CHANGED, el);
        break;
      default:
        this.events.emit(type, el);
        console.warn('Not implemented, announce of ', type, el);
    }
  }
}
module.exports = SyncWorker;
