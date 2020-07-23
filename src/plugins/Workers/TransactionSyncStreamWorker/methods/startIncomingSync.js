const logger = require('../../../../logger');

module.exports = async function startIncomingSync() {
  const { network } = this;
  const bestBlockHeight = await this.getBestBlockHeightFromTransport();
  const count = 0;
  const start = +new Date();
  logger.debug(`TransactionSyncStreamWorker - IncomingSync - Started from ${bestBlockHeight}, count: ${count}`);
  try {
    await this.syncUpToTheGapLimit(bestBlockHeight, count, network);
  } catch (e) {
    if (e.code === 1) {
      if (this.stream === null) {
        // NOOP on self canceled state (via stop worker)
        return;
      }
      logger.debug(`TransactionSyncStreamWorker - IncomingSync - Restarted from ${bestBlockHeight}, count: ${count}`);
      await startIncomingSync.call(this);
      return;
    }
    throw e;
  }
  logger.debug(`TransactionSyncStreamWorker - IncomingSync - Synchronized ${count} in ${+new Date() - start}ms`);
};
