/**
 * Add a transaction at a specific position
 * @param {Transaction} transaction
 * @param {number|null} pos
 */
module.exports = function insertAtPos(transaction, pos) {
  const { transactionIds, transactions } = this;
  if (pos != null) {
    // eslint-disable-next-line no-param-reassign
    if (pos > transactions.length) pos = transactions.length;
    transactions.splice(pos, 0, transaction);
    transactionIds.splice(pos, 0, transaction.hash);
  } else {
    transactions.push(transaction);
    transactionIds.push(transaction.hash);
  }
}
