const { TransactionNotInStore } = require('../../../errors');

function getTransaction(txid) {
  const { transactions } = this.store;
  if (!transactions[txid]) throw new TransactionNotInStore(txid);
  return this.store.transactions[txid];
}

module.exports = getTransaction;
