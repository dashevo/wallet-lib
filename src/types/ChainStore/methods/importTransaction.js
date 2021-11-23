const { Transaction } = require('@dashevo/dashcore-lib');

function importTransaction(transaction, metadata = {}) {
  // Even if transaction is a transaction object, if manglized,
  // it might end up not being a correct instanceof internally.
  const normalizedTransaction = new Transaction(transaction);
  this.state.transactions.set(normalizedTransaction.hash, {
    transaction: normalizedTransaction,
    metadata: {
      blockHash: metadata.blockHash || null,
      height: metadata.height || null,
      isInstantLocked: metadata.isInstantLocked || null,
      isChainLocked: metadata.isChainLocked || null,
    },
  });
  this.considerTransaction(normalizedTransaction.hash);
}

module.exports = importTransaction;
