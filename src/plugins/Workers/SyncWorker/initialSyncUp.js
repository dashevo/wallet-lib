const EVENTS = require('../../../EVENTS');
const logger = require('../../../logger');

module.exports = async function initialSyncUp() {
  const self = this;
  // For each new transaction emitted by transporter, we import to storage
  this.transporter.on(EVENTS.FETCHED_TRANSACTION, async (ev) => {
    const { payload: transaction } = ev;
    // Storage.importTransaction will announce the TX to parent
    await this.storage.importTransaction(transaction);
  });
  // The same is being done for fetch_address, but we also announce it.
  this.transporter.on(EVENTS.FETCHED_ADDRESS, async (ev) => {
    const { payload: address } = ev;
    this.announce(EVENTS.FETCHED_ADDRESS, address);
  });

  // Due to the events system, we need to handle the fact that we did subscribed to addresses
  // that we had received the transactions and store before
  // being able to release initialSyncUp as ready.
  // When we will move to bloomfilter, that part might be more complex.
  return new Promise((resolve) => {
    const addrList = this.getAddressListToSync().map((addr) => addr.address);
    const expectedAddrNumberToFetch = addrList.length;
    let expectedTxNumberToFetch = 0;
    let numberOfFetchedTx = 0;
    let fetchedAddresses = 0;
    const waiterTxFetchedListernerFn = async () => {
      numberOfFetchedTx += 1;
      logger.silly(`SyncWorker - init txWaiter : fetched : ${numberOfFetchedTx}/${expectedTxNumberToFetch}`);
      if (numberOfFetchedTx >= expectedTxNumberToFetch) {
        self.transporter.removeListener(EVENTS.FETCHED_TRANSACTION, waiterTxFetchedListernerFn);
        resolve(true);
      }
    };
    this.transporter.on(EVENTS.FETCHED_TRANSACTION, waiterTxFetchedListernerFn);

    const waiterAddressFetchedListenerFn = async (ev) => {
      const { payload: address } = ev;

      const subscribedAddress = self.transporter.state.subscriptions.addresses;
      const subscribedAddressList = Object.keys(self.transporter.state.subscriptions.addresses);

      fetchedAddresses = subscribedAddressList.reduce((accumulator, el) => {
        if (subscribedAddress[el].last !== null) {
          // eslint-disable-next-line no-param-reassign
          accumulator += 1;
        }
        return accumulator;
      }, 0);
      expectedTxNumberToFetch += address.utxos.length;
      logger.silly(`SyncWorker - init addrWaiter : fetched : ${fetchedAddresses}/${expectedAddrNumberToFetch}`);

      if (fetchedAddresses >= expectedAddrNumberToFetch) {
        if (expectedTxNumberToFetch === 0) {
          self.transporter.removeListener(EVENTS.FETCHED_TRANSACTION, waiterTxFetchedListernerFn);
          resolve(true);
        }
        self.transporter.removeListener(EVENTS.FETCHED_ADDRESS, waiterAddressFetchedListenerFn);
      }
    };
    this.transporter.on(EVENTS.FETCHED_ADDRESS, waiterAddressFetchedListenerFn);


    this.transporter.subscribeToAddressesTransactions(addrList);
  });
};
