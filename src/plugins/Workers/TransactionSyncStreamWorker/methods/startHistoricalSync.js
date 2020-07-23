const logger = require('../../../../logger');
/**
 *
 * @param {string} network
 * @return {Promise<void>}
 */
module.exports = async function startHistoricalSync(network) {
  const currentBlockHeight = this.getLastSyncedBlockHeight();
  const bestBlockHeight = await this.getBestBlockHeightFromTransport();
  const count = (bestBlockHeight - currentBlockHeight) || 1;
  const start = +new Date();
  logger.debug(`TransactionSyncStreamWorker - HistoricalSync - Started from ${currentBlockHeight}, count: ${count}`);
  try {
    await this.syncUpToTheGapLimit(currentBlockHeight, count, network);
  } catch (e) {
    if (e.code === 1) {
      if (this.stream === null) {
        // NOOP on self canceled state (via stop worker)
        return;
      }
      logger.debug(`TransactionSyncStreamWorker - HistoricalSync - Restarted from ${bestBlockHeight}, count: ${count}`);
      this.stream = null;
      await startHistoricalSync.call(this, network);
      return;
    }
    throw e;
  }

  this.setLastSyncedBlockHeight(count);
  logger.debug(`TransactionSyncStreamWorker - HistoricalSync - Synchronized ${count} in ${+new Date() - start}ms`);
};
