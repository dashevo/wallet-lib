const { Transaction } = require('@dashevo/dashcore-lib');
const fillGapLimit = require('./fillAddressesToGapLimit');

/**
 * Import an array of transactions or a transaction object to the store
 * @param transactions
 * @return {number}
 * */
const importTransactions = function (transactions) {
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
      self.importTransaction(tx);
    });
  } else {
    throw new Error('Invalid transaction. Cannot import.');
  }

  return fillGapLimit();
};
module.exports = importTransactions;
