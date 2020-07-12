const _ = require('lodash');
const fetchAddressTransactions = require('./fetchAddressTransactions');
const TransactionOrderer = require('./TransactionOrderer/TransactionOrderer');

module.exports = async function processAddressList(addressList) {
  const { transporter, importTransactions } = this;

  const boundFetchAddressTransactions = _.bind(fetchAddressTransactions, null, _, transporter);
  const transactionPromises = addressList.map(boundFetchAddressTransactions);

  const transactionsByAddresses = await Promise.all(transactionPromises);

  const transactions = _.flatten(transactionsByAddresses);

  const ordered = new TransactionOrderer();

  transactions.forEach((tx) => ordered.insert(tx));

  const boundImportTransaction = _.bind(importTransactions, _);

  const importPromises = ordered.transactions.map(boundImportTransaction);

  const generatedList = await Promise.all(importPromises);
  return generatedList.reduce((acc, n) => acc + n);
};
