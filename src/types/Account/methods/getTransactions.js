/**
 * Get transaction from the store
 * @return {[Transaction]} transactions - All transaction in the store
 */
module.exports = function getTransactions() {
  const chainStore = this.storage.getChainStore(this.network);
  const walletStore = this.storage.getWalletStore(this.walletId);
  const transactions = [];
  const { addresses } = walletStore.getPathState(this.accountPath);

  Object.values(addresses).forEach((address) => {
    const transactionIds = chainStore.getAddress(address).transactions;
    transactionIds.forEach((transactionId) => {
      const tx = chainStore.getTransaction(transactionId);
      transactions.push([tx.transaction, tx.metadata]);
    });
  });
  return transactions;
};
