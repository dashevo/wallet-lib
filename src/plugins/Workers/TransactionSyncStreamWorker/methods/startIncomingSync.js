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
  const lastSyncedBlockHeight = await this.getLastSyncedBlockHeight();
  const count = 0;

  logger.debug(`TransactionSyncStreamWorker - IncomingSync - Started from ${lastSyncedBlockHeight}`);

  try {
    const gapLimitIsReached = await this.syncUpToTheGapLimit(lastSyncedBlockHeight, count, network);
    if (gapLimitIsReached) {
      logger.debug(`TransactionSyncStreamWorker - IncomingSync - Restarted from ${lastSyncedBlockHeight}`);
      await startIncomingSync.call(this);
    }
  } catch (e) {
    if (GRPC_RETRY_ERRORS.includes(e.code)) {
      logger.debug(`TransactionSyncStreamWorker - IncomingSync - Restarted from ${lastSyncedBlockHeight}`);

      await startIncomingSync.call(this);

      return;
    }

    throw e;
  }
};
