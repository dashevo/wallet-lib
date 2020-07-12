const logger = require('../../../../logger');
/**
 *
 * @param {string} network
 * @return {Promise<void>}
 */
module.exports = async function startHistoricalSync(network) {
  logger.silly('TransactionSyncStreamWorker - started historical sync');

  let currentBlockHeight = this.getLastSyncedBlockHeight();

  // Fix issue with DAPI not able to resolve from genesis block
  // if (currentBlockHeight === 0) currentBlockHeight = 12493;
  if (currentBlockHeight === 0) currentBlockHeight = 21650;

  const bestBlockHeight = await this.getBestBlockHeight();
  const count = bestBlockHeight - currentBlockHeight;

  await this.syncUpToTheGapLimit(currentBlockHeight, count, network);
  logger.silly('TransactionSyncStreamWorker - synchronized with historical');
};
