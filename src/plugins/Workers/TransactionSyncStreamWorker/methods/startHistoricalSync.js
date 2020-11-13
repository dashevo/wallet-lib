const GrpcErrorCodes = require('@dashevo/grpc-common/lib/server/error/GrpcErrorCodes');

const logger = require('../../../../logger');

const GRPC_RETRY_ERRORS = [
  GrpcErrorCodes.DEADLINE_EXCEEDED,
  GrpcErrorCodes.UNAVAILABLE,
  GrpcErrorCodes.INTERNAL,
  GrpcErrorCodes.CANCELLED,
  GrpcErrorCodes.UNKNOWN,
];

const GRPC_COUNT_IS_TO_BIG_ERROR_DETAILS = '3 INVALID_ARGUMENT: count is too big, could not fetch more than blockchain length';

/**
 *
 * @param {string} network
 * @return {Promise<void>}
 */
module.exports = async function startHistoricalSync(network) {
  const lastSyncedBlockHash = this.getLastSyncedBlockHash();
  const bestBlockHeight = await this.getBestBlockHeightFromTransport();
  const lastSyncedBlockHeight = await this.getLastSyncedBlockHeight();
  const count = bestBlockHeight - lastSyncedBlockHeight || 1;
  const start = +new Date();

  try {
    const options = { count, network };
    // If there's no blocks synced, start from height 0, otherwise from the last block hash.
    if (lastSyncedBlockHash == null) {
      options.fromBlockHeight = lastSyncedBlockHeight;
    } else {
      options.fromBlockHash = lastSyncedBlockHash;
    }

    logger.debug(`TransactionSyncStreamWorker - HistoricalSync - Started from ${options.fromBlockHash || options.fromBlockHeight}, count: ${count}`);
    const gapLimitIsReached = await this.syncUpToTheGapLimit(options);
    if (gapLimitIsReached) {
      await startHistoricalSync.call(this, network);
    }
  } catch (e) {
    if (GRPC_RETRY_ERRORS.includes(e.code)) {
      if (this.stream === null && e.code === GrpcErrorCodes.CANCELLED) {
        // NOOP on self canceled state (via stop worker)
        logger.debug('TransactionSyncStreamWorker - HistoricalSync - The Worker is stopped');

        // As we fully synced at this point, we're setting up last synced height to be
        // equal to the chain tip height
        await this.setLastSyncedBlockHeight(bestBlockHeight);
        return;
      }

      logger.debug('TransactionSyncStreamWorker - HistoricalSync - Restarting the stream');

      this.stream = null;
      await startHistoricalSync.call(this, network);

      return;
    }

    if (
      e.code === GrpcErrorCodes.INVALID_ARGUMENT && e.message === GRPC_COUNT_IS_TO_BIG_ERROR_DETAILS
    ) {
      // This error is thrown when last synced block height is too small. To make the value
      // of count variable lower, we need to adjust last synced height.
      // Since there's no header sync as of the moment of writing, it's quite problematic to
      // pinpoint the exact height we're at at the moment, so we're finding it empirically
      await this.setLastSyncedBlockHeight(lastSyncedBlockHeight + 5);

      this.stream = null;
      await startHistoricalSync.call(this, network);
    }

    this.stream = null;
    throw e;
  }

  this.setLastSyncedBlockHeight(bestBlockHeight);

  logger.debug(`TransactionSyncStreamWorker - HistoricalSync - Synchronized ${count} in ${+new Date() - start}ms`);
};
