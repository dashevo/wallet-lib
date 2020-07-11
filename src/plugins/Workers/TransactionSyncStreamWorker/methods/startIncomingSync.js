module.exports = async function startIncomingSync(network) {
  this.syncIncomingTransactions = true;
  // let currentBlockHeight = this.getLastSyncedBlockHeight();

  // while (this.syncIncomingTransactions) {
    // Every time the gap limit is hit, we need to restart historical stream
    // until we synced up to the last block
    // currentBlockHeight = this.getLastSyncedBlockHeight();
    // await this.syncUpToTheGapLimit(currentBlockHeight, 0, network);
  // }
}
