const logger = require('../../../../logger');
const EVENTS = require('../../../../EVENTS');
const { DELAYED_TRANSACTION_CHECK_INTERVAL } = require('../../../../CONSTANTS');

async function handleTransactionFromStream(transaction) {
  const self = this;
  // As we require height information, we fetch transaction using client.
  // eslint-disable-next-line no-restricted-syntax
  // eslint-disable-next-line no-underscore-dangle
  const transactionHash = transaction._getHash().reverse().toString('hex');

  this.pendingRequest[transactionHash] = { isProcessing: true, type: 'transaction' };
  // eslint-disable-next-line no-await-in-loop
  const getTransactionResponse = await this.transport.getTransaction(transactionHash);

  if (!getTransactionResponse.blockHash) {
    logger.silly(`TransactionSyncStreamWorker - Unconfirmed transaction ${transactionHash}: delayed.`);
    this.delayedRequests[transactionHash] = { isDelayed: true, type: 'transaction' };

    return new Promise((resolve) => {
      self.parentEvents
        .on(
          EVENTS.BLOCKHEIGHT_CHANGED,
          () => {
            setTimeout(
              resolve(self.handleTransactionFromStream(transaction)),
              DELAYED_TRANSACTION_CHECK_INTERVAL,
            );
          },
        );
    });
  }

  const executor = async () => {
    if (self.delayedRequests[transactionHash]) {
      logger.silly(`TransactionSyncStreamWorker - Processing previously delayed transaction ${transactionHash} from stream`);
      delete self.delayedRequests[transactionHash];
    } else {
      logger.silly(`TransactionSyncStreamWorker - Processing transaction ${transactionHash} from stream`);
    }

    this.pendingRequest[getTransactionResponse.blockHash.toString('hex')] = { isProcessing: true, type: 'blockheader' };
    // eslint-disable-next-line no-await-in-loop
    const getBlockHeaderResponse = await this
      .transport
      .getBlockHeaderByHash(getTransactionResponse.blockHash);
    // eslint-disable-next-line no-await-in-loop
    await this.importBlockHeader(getBlockHeaderResponse);
    delete this.pendingRequest[getTransactionResponse.blockHash.toString('hex')];
  };

  await executor();

  const metadata = {
    blockHash: getTransactionResponse.blockHash,
    height: getTransactionResponse.height,
    instantLocked: getTransactionResponse.instantLocked,
    chainLocked: getTransactionResponse.chainLocked,
  };

  delete this.pendingRequest[transactionHash];

  return {
    transaction,
    transactionHash,
    metadata,
    transactionResponse: getTransactionResponse,
  };
}

module.exports = handleTransactionFromStream;
