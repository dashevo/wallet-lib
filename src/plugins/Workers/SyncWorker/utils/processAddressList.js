const _ = require('lodash');
const fetchAddressTransactions = require('./fetchAddressTransactions');
const TransactionOrderer = require('./TransactionOrderer/TransactionOrderer');

/**
 *
 * @param addressList
 * @returns {Promise<number>}
 */
module.exports = async function processAddressList(addressList) {
  const { transport, importTransactions } = this;

  const boundFetchAddressTransactions = _.bind(fetchAddressTransactions, null, _, transport);
  const transactionPromises = addressList.map(boundFetchAddressTransactions);

  const transactionsByAddresses = await Promise.all(transactionPromises);

  const transactions = _.flatten(transactionsByAddresses);

  const ordered = new TransactionOrderer();

  transactions.forEach((tx) => ordered.insert(tx));

  // const boundImportTransaction = _.bind(storage.importTransaction, storage, _, transport);
  const boundImportTransaction = _.bind(importTransactions, _);

  const importPromises = ordered.transactions.map(boundImportTransaction);

  const generatedList = await Promise.all(importPromises);

  if (generatedList.length === 0) return 0;
  return generatedList.reduce((acc, n) => acc + n);
};
