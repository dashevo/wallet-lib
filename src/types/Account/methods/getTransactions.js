/**
 * Get transaction from the store
 * @return {[Transaction]} transactions - All transaction in the store
 */
module.exports = function getTransactions() {
  const chainStore = this.storage.getChainStore(this.network);
  const transactions = [];
  const { addresses } = this.storage.getWalletStore(this.walletId).getPathState(this.accountPath);
  Object.values(addresses).forEach((address) => {
    transactions.push(...chainStore.getAddress(address).transactions);
  });
  return transactions;
};
