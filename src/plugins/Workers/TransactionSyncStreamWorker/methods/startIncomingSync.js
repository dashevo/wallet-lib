const logger = require('../../../../logger');

module.exports = async function startIncomingSync() {
  const { network } = this;
  const bestBlockHeight = await this.getBestBlockHeightFromTransport();
  const count = 0;
  logger.debug(`TransactionSyncStreamWorker - IncomingSync - Started from ${bestBlockHeight}, count: ${count}`);
  return this.syncUpToTheGapLimit(bestBlockHeight, count, network);
};
