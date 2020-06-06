const { Transaction } = require('@dashevo/dashcore-lib');
const is = require('../../../../utils/is');

/**
 * Allows to manage transactions and canonically order them by
 * having all transactions linked by their prevTxId previous inputs
 */
class TransactionOrderer {
  constructor() {
    this.transactions = [];
    // Only uses is to speed up lookups
    this.transactionIds = [];
  }

  /**
   * @param {Transaction} transaction
   * @return {boolean}
   */
  insert(transaction) {
    if (!(transaction instanceof Transaction)) throw new Error('Expect input of type Transaction');
    const { hash } = transaction;
    const { transactionIds, transactions } = this;
    const alreadyInserted = this.lookupByTransactionHash(hash);
    if (!alreadyInserted) {
      if (!transactionIds.length) {
        transactions.push(transaction);
        transactionIds.push(hash);
        return true;
      }

      const predecessorResults = this.lookupInputsPredecessors(transaction);

      const successorResults = this.lookupTxIdSuccessors(hash);
      // If we have a successor, our tx need to be inserted before it
      const successorPos = (successorResults.length) ? successorResults[0].pos : null;

      // If we have predecessor it needs to be inserted after it
      const predecessorPos = (predecessorResults.length)
        ? predecessorResults[predecessorResults.length - 1].pos
        : null;

      let pos = (predecessorPos != null) ? predecessorPos + 1 : null;
      if (successorPos != null && predecessorPos != null) {
        pos = successorPos;
      }

      // If we added a successor before a predecessor we need to extract from
      // successor to predecessor and put it after the predecessor. We then can insert.
      if (successorPos != null && predecessorPos != null && predecessorPos > successorPos) {
        const extractedTx = transactions.splice(successorPos, predecessorPos - successorPos);
        const extractedIds = transactionIds.splice(successorPos, predecessorPos - successorPos);
        transactions.splice(successorPos + 1, 0, ...extractedTx);
        transactionIds.splice(successorPos + 1, 0, ...extractedIds);
        this.insertAtPos(transaction, successorPos + 1);
      } else {
        this.insertAtPos(transaction, pos);
      }
      return true;
    }
    return false;
  }

  /**
   * Add a transaction at a specific position
   * @param {Transaction} transaction
   * @param {number|null} pos
   */
  insertAtPos(transaction, pos) {
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

  /**
   *  Will lookup for predecessors of the inputs's transactions
   * @param {Transaction} transaction
   * @return {Object[]} results - Ordered array of lookup results
   */
  lookupInputsPredecessors(transaction) {
    if (!(transaction instanceof Transaction)) throw new Error('Expect input of type Transaction');
    const { inputs } = transaction;
    const lookupResults = [];

    inputs.forEach((input) => {
      const lookupResult = this.lookupByTransactionHash(input.prevTxId.toString('hex'));
      if (lookupResult) lookupResults.push(lookupResult);
    });

    return lookupResults.sort((a, b) => a.pos - b.pos);
  }

  /**
   * Will lookup for successors of the txid provided
   * @param {Transaction.hash} hash - hash of the predecessor for the seeked successors
   * @return {Object[]} results - Ordered array of successors results
   */
  lookupTxIdSuccessors(hash) {
    if (!is.txid(hash)) throw new Error('Expected lookup parameter to be a txid');
    const lookupResults = [];

    if (!this.transactions.length) return lookupResults;

    this.transactions.forEach((transaction, pos) => {
      const { inputs } = transaction;
      // eslint-disable-next-line no-restricted-syntax
      for (const input of inputs) {
        const prevTxId = input.prevTxId.toString('hex');
        if (prevTxId === hash) {
          lookupResults.push({ tx: transaction, pos });
        }
      }
    });
    return lookupResults;
  }

  /**
   * Reset the local arrays
   */
  reset() {
    this.transactions = [];
    this.transactionIds = [];
  }

  /**
   * Lookup locally if the transaction hash is already added
   * @param {Transaction.hash} hash
   * @return {{tx: *, pos: number}|null}
   */
  lookupByTransactionHash(hash) {
    if (!is.txid(hash)) throw new Error('Expected lookup parameter to be a txid');
    const index = this.transactionIds.indexOf(hash);
    if (index === -1) {
      return null;
    }
    return { tx: this.transactions[index], pos: index };
  }
}

module.exports = TransactionOrderer;
