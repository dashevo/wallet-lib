const logger = require('../../../../logger');

/**
 *
 * @param {number} fromBlockHeight
 * @param {number} count
 * @param {string} network
 * @return {Promise<unknown>}
 */
module.exports = async function syncUpToTheGapLimit(fromBlockHeight, count, network) {
  const addresses = this.getAddressesToSync();

  const stream = await this.transporter
    .subscribeToTransactionsWithProofs(addresses, { fromBlockHeight, count });

  this.stream = stream;

  return new Promise((resolve, reject) => {
    let transactions = [];
    stream
      .on('data', (response) => {
        const transactionsFromResponse = this.constructor
          .getTransactionListFromStreamResponse(response);
        const walletTransactions = this.constructor
          .filterWalletTransactions(transactionsFromResponse, addresses, network);

        transactions = transactions.concat(walletTransactions.transactions);

        if (transactions.length) {
          const addressesGeneratedCount = this.importTransactions(transactions);

          if (addressesGeneratedCount > 0) {
            logger.silly('TransactionSyncStreamWorker - end stream - new addresses generated');
            // If there are some new addresses being imported
            // to the storage, that mean that we hit the gap limit
            // and we need to update the bloom filter with new addresses,
            // i.e. we need to open another stream with a bloom filter
            // that contains new addresses.
            // TODO: is this will call stream.on('end', cb)?
            stream.end();
          }
        }
      })
      .on('error', (err) => {
        stream.cancel();
        reject(err);
      })
      .on('end', () => {
        resolve(transactions);
      });
  });
};
