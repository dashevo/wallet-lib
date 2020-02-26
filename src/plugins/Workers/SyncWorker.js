/* eslint-disable no-restricted-syntax */
const _ = require('lodash');
const logger = require('../../logger');
const { Worker } = require('../');
const { ValidTransportLayerRequired, InvalidTransactionObject } = require('../../errors');
const EVENTS = require('../../EVENTS');
const { UNCONFIRMED_TRANSACTION_STATUS_CODE, SECURE_TRANSACTION_CONFIRMATIONS_NB } = require('../../CONSTANTS');

// eslint-disable-next-line no-underscore-dangle
const _defaultOpts = {
  // Thoses are addresses that were used only once, and long time ago.
  // Low chance of receiving fund. We still check every ten minutes
  slowFetchThresold: 5 * 60 * 1000,
  // Those are addresses that we consider standard, InstantSend promise a one minute time,
  // That is what we offer here (will be changed with streams)
  fetchThreshold: 60 * 1000,
  // Those are special cases, such as the current unusedAddress for instance,
  // Higher chance of receiving tx, we listen in a quite spammy ways.
  fastFetchThreshold: 15 * 1000,
  // Loop will go through every 10 sec
  workerIntervalTime: 10 * 1000,
};

/**
 * SyncWorker is a worker that is responsible for fetching address, transactions
 * and dealing with ensuring syncing the accounts data in general (for chain, see ChainWorker).
 *
 */
class SyncWorker extends Worker {
  /**
   * Create the syncWorker instance
   * @param opts
   */
  constructor(opts = JSON.parse(JSON.stringify(_defaultOpts))) {
    const defaultOpts = JSON.parse(JSON.stringify(_defaultOpts));
    const params = {
      name: 'SyncWorker',
      executeOnStart: true,
      firstExecutionRequired: true,
      workerIntervalTime: defaultOpts.workerIntervalTime,
      fetchThreshold: defaultOpts.fetchThreshold,
      dependencies: [
        'storage', 'transporter', 'fetchStatus', 'getTransaction', 'fetchAddressInfo', 'walletId', 'getUnusedAddress',
      ],
      ...opts,
    };
    super(params);
    this.isBIP44 = _.has(opts, 'isBIP44') ? opts.isBIP44 : true;

    this.listeners = {
      addresses: [],
    };
    this.bloomfilters = [];
  }

  async execute() {
    // Mostly in order to get our history in sync when we are not listening for new events.
    // We will fetch address summary of our addresses that :
    // - Didn't fetched new update for a bigger period than fetchThreshold (concern all addresses)
    // - If we have an unconfirmed balance
    // - Have more chance to have new tx coming in
    // (typically the result of getUnusedAddress,
    // and preemptively in case of us not receiving the tx from listeners)
    await this.execAddressFetching();

    // We execute a fetching of all the transactions that are unknown
    await this.execTransactionsFetching();


    await this.execAddressListener();
    await this.execAddressBloomfilter();
  }

  async execAddressListener() {
    const self = this;
    const listenerAddresses = [];
    this.listeners.addresses.filter((listener) => listenerAddresses.push(listener.address));
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
      const listenerObj = { ...listener };
      listenerObj.cb = function (event) {
        logger.info('Event:', event, listenerObj.address);
      };

      this.listeners.addresses.push(listener);
      // self.transporter.subscribeToAddressesTransactions(listener.address, cb.bind({ listener }));
      //
      // await self.transporter.subscribeToBlocks();
      // self.transporter.on(EVENTS.BLOCK, (ev) => {
      //   const { network } = self.storage.store.wallets[self.walletId];
      //   const { payload: block } = ev;
      //   self.announce(EVENTS.BLOCK, block);
      //   self.announce(EVENTS.BLOCKHEADER, block.header);
      //   console.log('RECEIVED BLOCKHEADER', block.header);
      //   self.storage.importBlockHeader(block.header);
      //   self.announce(
      //       EVENTS.BLOCKHEIGHT_CHANGED,
      //       self.storage.store.chains[network.toString()].blockHeight,
      //   );
      // });
    });

    // TODO : Finish me when BloomFilter are available via subscribeToTransactionsWithProofs
    // const subscribedAddress = this.listeners.addresses.reduce((acc, el) => {
    //   acc.push(el.address);
    //   return acc;
    // }, []);
    //
    // const getTransactionAndStore = async function (tx) {
    //   if (tx.address && tx.txid) {
    //     self.storage.addNewTxToAddress(tx, tx.address);
    //     const transactionInfo = await self.transporter.getTransactionById(tx.txid);
    //     self.storage.importTransactions(transactionInfo);
    //   }
    // };
    // await self.transporter.subscribeToAddresses(subscribedAddress, getTransactionAndStore);
    return true;
  }

  async execAddressFetching() {
    const self = this;
    const { addresses, network } = this.storage.getStore().wallets[this.walletId];
    const currBlockheight = this.storage.getStore().chains[network.toString()].blockHeight;
    const currTime = Date.now();
    const { fetchAddressInfo } = this;

    const toFetchAddresses = [];

    let nbPreviousUsed = 0;
    for (const walletType of Object.keys(addresses)) {
      const walletAddresses = addresses[walletType];
      const walletPaths = Object.keys(walletAddresses);
      if (walletPaths.length > 0) {
        for (const path of walletPaths) {
          const address = walletAddresses[path];
          let shouldFetch = false;

          const isUsed = address.used;
          // This will make all last address (the one we got from unconfirmedAddress)
          // to basically check each time
          const isFirstAndUnused = isUsed === false && address.index === 0;

          // The five next unused address
          const hasMostChanceToReceiveTx = nbPreviousUsed < 5 && isUsed === false;
          const hasUnconfirmedBalance = address.unconfirmedBalanceSat > 0;

          const hasReachFastThreshold = address.fetchedLast < (currTime - self.fastFetchThreshold);
          const hasReachStandardThreshold = address.fetchedLast < (currTime - self.fetchThreshold);
          const hasReachSlowThreshold = address.fetchedLast < (currTime - self.slowFetchThresold);
          // This is for high refresh rate addresses, they still have a threeshold.
          if ((isFirstAndUnused
              || hasUnconfirmedBalance
              || hasMostChanceToReceiveTx) && hasReachFastThreshold
          ) {
            shouldFetch = true;
          } else if (!isUsed
              && ((nbPreviousUsed <= 10 && hasReachStandardThreshold))
          ) {
            // The next 10 unused address got a standard threshold
            shouldFetch = true;
          } else if (isUsed && address.transactions.length === 1) {
            // Tis might be a single used and throw address. Let's figure tx age
            // eslint-disable-next-line no-await-in-loop
            const tx = await self.getTransaction(address.transactions[0]);
            if (currBlockheight - tx.blockHeight < 20000 && hasReachStandardThreshold) {
              shouldFetch = true;
            }
          } else if (isUsed && address.transactions.length > 1 && hasReachStandardThreshold) {
            shouldFetch = true;
          }

          if (hasReachSlowThreshold) {
            shouldFetch = true;
          }
          if (shouldFetch) {
            toFetchAddresses.push(address);
          }
          if (!isUsed) {
            nbPreviousUsed += 1;
          }
        }
      }
    }

    const promises = [];
    toFetchAddresses.forEach((addressObj) => {
      // We set at false so we don't autofetch utxos.
      // This part will be done in the tx fetching time
      // const p = fetchAddressInfo(addressObj, false)
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
        if (prev.found && (!addrInfo.utxos || Object.keys(addrInfo).length === 0)) {
          // eslint-disable-next-line no-param-reassign
          addrInfo.utxos = prev.result.utxos;
        }
        self.storage.updateAddress(addrInfo, self.walletId);
      } catch (e) {
        const eventType = EVENTS.ERROR_UPDATE_ADDRESS;
        self.parentEvents.emit(eventType, { type: eventType, payload: e });
      }
    });
    const eventType = EVENTS.FETCHED_ADDRESS;
    this.parentEvents.emit(eventType, { type: eventType, payload: responses });
  }

  async execTransactionsFetching() {
    const self = this;
    const { transactions, wallets } = this.storage.getStore();
    const { blockHeight, addresses } = wallets[this.walletId];
    const { getTransaction } = this;

    const toFetchTransactions = [];
    const unconfirmedThreshold = SECURE_TRANSACTION_CONFIRMATIONS_NB;

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
            } else if (transactions[txid].blockHeight === UNCONFIRMED_TRANSACTION_STATUS_CODE) {
              toFetchTransactions.push(txid);
            } else if (blockHeight - transactions[txid].blockHeight < unconfirmedThreshold) {
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
      // account.getTransaction already handle the cache storage
      const p = getTransaction(transactionObj);
      promises.push(p);
    });

    const resolvedPromised = await Promise.all(promises);
    const eventType = EVENTS.FETCHED_TRANSACTIONS;
    this.parentEvents.emit(eventType, { type: eventType, payload: resolvedPromised });
    return true;
  }

  async execAddressBloomfilter() {
    const bloomfilterAddresses = [];
    this.bloomfilters.filter((bloom) => bloomfilterAddresses.push(bloom.address));
    const toPushBloom = [];

    toPushBloom.forEach((bloom) => {
      this.bloomfilters.push(bloom);
    });
    return true;
  }

  announce(type, el) {
    switch (type) {
      case EVENTS.BLOCK:
        this.parentEvents.emit(EVENTS.BLOCK, { type: EVENTS.BLOCK, payload: el });
        break;
      case EVENTS.BLOCKHEIGHT_CHANGED:
        this.parentEvents.emit(EVENTS.BLOCKHEIGHT_CHANGED,
          { type: EVENTS.BLOCKHEIGHT_CHANGED, payload: el });
        break;
      default:
        this.parentEvents.emit(type, { type, paylaod: el });
        logger.warn('Not implemented, announce of ', { type, el });
    }
  }
}

module.exports = SyncWorker;
