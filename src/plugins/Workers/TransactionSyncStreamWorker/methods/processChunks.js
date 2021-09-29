/* eslint-disable no-param-reassign */
const logger = require('../../../../logger');

function isAnyIntersection(arrayA, arrayB) {
  const intersection = arrayA.filter((e) => arrayB.indexOf(e) > -1);
  return intersection.length > 0;
}
async function processChunks(dataChunk) {
  const self = this;
  const addresses = this.getAddressesToSync();
  const network = this.network;
  /* First check if any instant locks appeared */
  const instantLocksReceived = this.constructor.getInstantSendLocksFromResponse(dataChunk);
  instantLocksReceived.forEach((isLock) => {
    this.importInstantLock(isLock);
  });

  /* Incoming transactions handling */
  const transactionsFromResponse = this.constructor
    .getTransactionListFromStreamResponse(dataChunk);
  const walletTransactions = this.constructor
    .filterWalletTransactions(transactionsFromResponse, addresses, network);

  if (walletTransactions.transactions.length) {
    // As we require height information, we fetch transaction using client.
    const awaitingPromises = walletTransactions.transactions
      .map((transaction) => self.handleTransactionFromStream(transaction)
        .then(({
          transactionResponse,
          metadata,
        }) => [transactionResponse.transaction, metadata]));

    const transactionsWithMetadata = await Promise.all(awaitingPromises);
    console.log({transactionsWithMetadata});

    const addressesGeneratedCount = await self
      .importTransactions(transactionsWithMetadata);

    self.hasReachedGapLimit = self.hasReachedGapLimit || addressesGeneratedCount > 0;

    if (self.hasReachedGapLimit) {
      logger.silly('TransactionSyncStreamWorker - end stream - new addresses generated');
      // If there are some new addresses being imported
      // to the storage, that mean that we hit the gap limit
      // and we need to update the bloom filter with new addresses,
      // i.e. we need to open another stream with a bloom filter
      // that contains new addresses.

      // DO not setting null this.stream allow to know we
      // need to reset our stream (as we pass along the error)
      self.stream.cancel();
    }
  }

  /* Incoming Merkle block handling */
  const merkleBlockFromResponse = this.constructor
    .getMerkleBlockFromStreamResponse(dataChunk);

  if (merkleBlockFromResponse) {
    // Reverse hashes, as they're little endian in the header
    const transactionsInHeader = merkleBlockFromResponse.hashes.map((hashHex) => Buffer.from(hashHex, 'hex').reverse().toString('hex'));
    const transactionsInWallet = Object.keys(self.storage.getStore().transactions);
    const isTruePositive = isAnyIntersection(transactionsInHeader, transactionsInWallet);
    if (isTruePositive) {
      self.importBlockHeader(merkleBlockFromResponse.header);
    }
  }
}
module.exports = processChunks;
