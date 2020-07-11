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
        const transactionsFromResponse = TransactionSyncStreamWorker
          .getTransactionListFromStreamResponse(response);
        const walletTransactions = TransactionSyncStreamWorker
          .filterWalletTransactions(transactionsFromResponse, addresses, network);

        transactions = transactions.concat(walletTransactions);
        const addressesGeneratedCount = this.storage.importTransactions(transactions);

        // const addressesGeneratedCount = this.fillAddressesToGapLimit();
        if (addressesGeneratedCount > 0) {
          // If there are some new addresses being imported
          // to the storage, that mean that we hit the gap limit
          // and we need to update the bloom filter with new addresses,
          // i.e. we need to open another stream with a bloom filter
          // that contains new addresses.
          // TODO: is this will call stream.on('end', cb)?
          stream.end();
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
