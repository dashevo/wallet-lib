const logger = require('../../../../logger');

module.exports = async function startIncomingSync() {
  const { network } = this;
  const bestBlockHeight = await this.getBestBlockHeightFromTransport();
  const count = 0;
  const start = +new Date();
  logger.debug(`TransactionSyncStreamWorker - IncomingSync - Started from ${bestBlockHeight}, count: ${count}`);
  await this.syncUpToTheGapLimit(bestBlockHeight, count, network);
  logger.debug(`TransactionSyncStreamWorker - IncomingSync - Synchronized ${count} in ${+new Date() - start}ms`);
};
