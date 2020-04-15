
const { Transaction } = require('@dashevo/dashcore-lib');
const fs = require('fs');
const transactions = require('../data/transactions/transactions');

module.exports = async function getTransaction(transactionHash) {
  const txFile = JSON.parse(fs.readFileSync(`./fixtures/FakeDevnet/data/transactions/${transactionHash}.json`));
  return new Transaction(Buffer.from(txFile.transaction, 'hex'));

};
