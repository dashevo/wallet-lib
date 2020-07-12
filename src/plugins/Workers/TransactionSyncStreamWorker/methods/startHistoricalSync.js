/**
 *
 * @param {string} network
 * @return {Promise<void>}
 */
module.exports = async function startHistoricalSync(network) {
  // TODO: read the last synced block hash from the storage
  let currentBlockHeight = this.getLastSyncedBlockHeight();

  // Fix issue with DAPI not able to resolve from genesis block
  //{ fromBlockHeight: 12493, count: 2 }
  // if (currentBlockHeight === 0) currentBlockHeight = 12493;
  if (currentBlockHeight === 0) currentBlockHeight = 21650;

  const bestBlockHeight = await this.getBestBlockHeight();
  const count = bestBlockHeight - currentBlockHeight;

  // while (blocksLeft !== 0) {
    // Every time the gap limit is hit, we need to restart historical stream
    // until we synced up to the last block
    // currentBlockHeight = this.getLastSyncedBlockHeight();
    // blocksLeft -= currentBlockHeight;
    // eslint-disable-next-line no-await-in-loop
    await this.syncUpToTheGapLimit(currentBlockHeight, 2, network);
  // }
};
