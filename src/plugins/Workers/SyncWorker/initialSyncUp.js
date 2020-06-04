const EVENTS = require('../../../EVENTS');
const logger = require('../../../logger');
const fetchAndStoreAddressTransactions = require('./utils/fetchAndStoreAddressTransactions');

// This method is called as first thing by the SyncWorker.
// It's only when resolved that the Wallet will be ready (for what SyncWorker do)
// And therefore that's where we need to deal with all necessary step
// such as fetching all UTXO and previous TX.
//
// It should deal with additional addresses generated by a BIP44 Worker if
// fetching here found that we have more addresses that on starting of the sync up.
module.exports = async function initialSyncUp() {
  const { transporter, storage } = this;

  const addrList = this.getAddressListToSync().map((addr) => addr.address);

  // Due to the events system, we need to handle the fact that we did subscribed to addresses
  // that we had received the transactions and store before
  // being able to release initialSyncUp as ready.
  // When we will move to bloomfilter, that part might be more complex.
  return new Promise(async (resolve) => {
    for(let address of addrList){
      // We need to wait for fetching and addition to be done sequentially
      // to correctly manage our balance as input can be output in prev tx.
      // noinspection ES6AwaitOutsideAsyncFunction
      await fetchAndStoreAddressTransactions(address, transporter, storage)
    }
    logger.silly('SyncWorker - initialSyncUp - Fully synced');
    resolve();
  });
};
