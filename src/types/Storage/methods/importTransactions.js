const { Transaction } = require('@dashevo/dashcore-lib');

/**
 * Import an array of transactions or a transaction object to the store
 * @param {[[Transaction, TransactionMetaData]][Transaction]|Transaction} transactions
 * @return {number}
 * */
const importTransactions = function importTransactions(transactions) {
  const type = transactions.constructor.name;
  const self = this;
  if (type === Transaction.name) {
    self.importTransaction(transactions);
  } else if (type === 'Object') {
    const transactionsIds = Object.keys(transactions);
    if (transactionsIds.length === 0) {
      throw new Error('Invalid transaction');
    }
    transactionsIds.forEach((id) => {
      const transaction = transactions[id];
      self.importTransaction(transaction);
    });
  } else if (type === 'Array') {
    transactions.forEach((tx) => {
      if (tx.constructor.name === 'Array') {
        self.importTransaction(tx[0], tx[1]);
      } else {
        self.importTransaction(tx);
      }
    });
  } else {
    throw new Error('Invalid transaction. Cannot import.');
  }
};
module.exports = importTransactions;
