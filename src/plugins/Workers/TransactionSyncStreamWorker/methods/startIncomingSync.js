const GrpcErrorCodes = require('@dashevo/grpc-common/lib/server/error/GrpcErrorCodes');

const logger = require('../../../../logger');

const GRPC_RETRY_ERRORS = [
  GrpcErrorCodes.DEADLINE_EXCEEDED,
  GrpcErrorCodes.UNAVAILABLE,
  GrpcErrorCodes.INTERNAL,
  GrpcErrorCodes.CANCELLED,
  GrpcErrorCodes.UNKNOWN,
];

module.exports = async function startIncomingSync() {
  const { network } = this;
  const lastSyncedBlockHash = await this.getLastSyncedBlockHash();
  const lastSyncedBlockHeight = await this.getLastSyncedBlockHeight();
  const count = 0;

  try {
    const options = { count, network };
    // If there's no blocks synced, start from height 0, otherwise from the last block hash.
    if (lastSyncedBlockHash == null) {
      options.fromBlockHeight = lastSyncedBlockHeight;
    } else {
      options.fromBlockHash = lastSyncedBlockHash;
    }

    const gapLimitIsReached = await this.syncUpToTheGapLimit(options);
    if (gapLimitIsReached) {
      logger.debug(`TransactionSyncStreamWorker - IncomingSync - Restarted from ${lastSyncedBlockHash}`);
      await startIncomingSync.call(this);
    }
  } catch (e) {
    if (GRPC_RETRY_ERRORS.includes(e.code)) {
      logger.debug(`TransactionSyncStreamWorker - IncomingSync - Restarted from ${lastSyncedBlockHash}`);

      await startIncomingSync.call(this);

      return;
    }

    throw e;
  }
};
