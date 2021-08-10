const { each } = require('lodash');
const _ = require('lodash');
const { TRANSACTION_HISTORY_TYPES } = require('../../../CONSTANTS');
const {
  filterTransactions,
  categorizeTransactions,
  extendTransactionsWithMetadata,
} = require('../../../utils');

const sortbyTimeDescending = (a, b) => (b.time - a.time);
const sortByHeightDescending = (a, b) => (b.height - a.height);

/**
 * Get all the transaction history already formated
 * @return {Promise<TransactionsHistory>}
 */
async function getTransactionHistory() {
  const transactionHistory = [];

  const {
    walletId,
    walletType,
    index: accountIndex,
    storage,
    network,
  } = this;
  const transactions = this.getTransactions();
  const store = storage.getStore();

  const chainStore = store.chains[network.toString()];
  const { blockHeaders } = chainStore;

  const { wallets: walletStore, transactionsMetadata } = store;

  const accountStore = walletStore[walletId];

  // In store, not all transaction are specific to this account, we filter our transactions.
  const filteredTransactions = filterTransactions(
    accountStore,
    walletType,
    accountIndex,
    transactions,
  );
  const filteredTransactionsWithMetadata = extendTransactionsWithMetadata(
    filteredTransactions,
    transactionsMetadata,
  );

  const categorizedTransactions = categorizeTransactions(
    filteredTransactionsWithMetadata,
    accountStore,
  );

  const sortedCategorizedTransactions = categorizedTransactions.sort(sortByHeightDescending);

  each(sortedCategorizedTransactions, (categorizedTransaction) => {
    const { blockHash } = categorizedTransaction;
    // To get time of block, let's find the blockheader.
    const blockHeader = blockHeaders[blockHash];
    const { time } = blockHeader;

    // Would require knowing the vout of this vin to determinate inputAmount.
    // const { inputs, outputs } = categorizedTransaction.transaction;
    // const inputAmount = 0;
    // const outputAmount = outputs.reduce((acc, output) => (acc + output.satoshis), 0);
    // const transactionFee = (transaction.isCoinbase() ? 0 : inputAmount - outputAmount);
    const normalizedTransactionHistory = {
      // fees: transactionFee,
      from: [{
        address: null,
        satoshis: null,
      }],
      to: [{
        address: null,
        satoshis: null,
      }],
      // received, sent...
      type: TRANSACTION_HISTORY_TYPES.SENT,
      time,
      txId: categorizedTransaction.transaction.hash,
      blockHash: categorizedTransaction.blockHash,
      isChainLocked: categorizedTransaction.isChainLocked,
      isInstantLocked: categorizedTransaction.isInstantLocked,
    };

    transactionHistory.push(normalizedTransactionHistory);
  });
  // Sort by decreasing time.
  return transactionHistory.sort(sortbyTimeDescending);
}

module.exports = getTransactionHistory;
