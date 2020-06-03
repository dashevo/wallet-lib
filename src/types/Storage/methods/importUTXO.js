const { Transaction } = require('@dashevo/dashcore-lib');
const { Output } = Transaction;
const { FETCHED_UTXO } = require('../../../EVENTS');
/**
 * This method is used to import a UTXO in Store.
 * @param {Output} output - A valid UTXO
 * @param {String} transactionHash - transactionHash where this output is existing
 * @param {Number} outputIndex - outputIndex of the output within the transaction
 */
const importUTXO = function importUTXO(output, transactionHash, outputIndex) {
  const { network } = this;
  if (!output) throw new Error('Expect output to import');
  if (!transactionHash) throw new Error('Expect transactionHash of the output to be provided');
  if (!outputIndex) throw new Error('Expect outputIndex to be provided');

  if (output.constructor !== Transaction.Output) {
    throw new Error(`Invalid output: Expected ${Output.name} but got ${output.constructor.name} - ${JSON.stringify(output.toJSON())}`);
  }
  const search = this.searchAddress(output.script.toAddress(network).toString());
  if (search.found) {
    this.addUTXOToAddress(output, search.result.address, transactionHash, outputIndex);
    this.announce(FETCHED_UTXO, { output });
  }
};
module.exports = importUTXO;
