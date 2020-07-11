/**
 *
 * @param {string} network
 * @return {Promise<void>}
 */
module.exports = async function startHistoricalSync(network) {
  // TODO: read the last synced block hash from the storage
  let currentBlockHeight = 0;

  console.log(this.storage.getStore().wallets[this.walletId]);

  return;

  // const { addresses } = this.storage.getStore().wallets[this.walletId];


  const bestBlockHeight = await this.getBestBlockHeight();
  let blocksLeft = bestBlockHeight - currentBlockHeight;

  while (blocksLeft !== 0) {
    // Every time the gap limit is hit, we need to restart historical stream
    // until we synced up to the last block
    currentBlockHeight = this.getLastSyncedBlockHeight();
    blocksLeft -= currentBlockHeight;
    await this.syncUpToTheGapLimit(currentBlockHeight, bestBlockHeight, network);
  }
}
