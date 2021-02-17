/**
 * Get a transaction from a provided txid
 * @param {transactionId} txid - Transaction Hash
 * @return {Promise<Transaction>}
 */
async function getTransaction(txid = null) {
  const search = await this.storage.searchTransaction(txid);
  if (search.found) {
    return search.result;
  }
  const tx = await this.transport.getTransaction(txid);
  if (this.cacheTx) {
    await this.importTransactions(tx);
  }
  return tx;
}

module.exports = getTransaction;
