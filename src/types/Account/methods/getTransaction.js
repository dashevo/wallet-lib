/**
 * Get a transaction from a provided txid
 * @param {transactionId} txid - Transaction Hash
 * @return {Promise<{metadata: {blockHash, chainLocked, instantLocked, height}, transaction}>}
 */
async function getTransaction(txid = null) {
  const search = await this.storage.searchTransaction(txid);
  if (search.found) {
    return search.result;
  }
  const getTransactionResponse = await this.transport.getTransaction(txid);
  if (!getTransactionResponse) return null;
  const {
    transaction,
    blockHash,
    height,
    instantLocked,
    chainLocked,
  } = getTransactionResponse;

  const metadata = {
    blockHash,
    height,
    instantLocked,
    chainLocked,
  };
  if (this.cacheTx) {
    await this.importTransactions([transaction, metadata]);
    if (this.cacheBlockHeaders) {
      const searchBlockHeader = this.storage.searchBlockHeader(height);
      if (!searchBlockHeader.found) {
        // Trigger caching of blockheader
        await this.getBlockHeader(height);
      }
    }
  }
  return { transaction, metadata };
}

module.exports = getTransaction;
