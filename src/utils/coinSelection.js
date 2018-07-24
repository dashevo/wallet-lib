const is = require('./../utils/is');
const feeCalculation = require('./feeCalculation');

module.exports = function coinSelection(utxosList, outputs, feeRate = feeCalculation()) {
  console.log('Coin selection with');
  console.log('UTXOSlist :');
  console.log(utxosList);
  console.log('output:');
  console.log(outputs);
  console.log('feeRate');
  if (!is.feeRate(feeRate)) throw new Error('Invalid feeRate');
  console.log(feeRate);
  const selection = {};
  // Order by size
  let utxos = [];
  utxos = utxosList.sort((a, b) => a.amount - b.amount);

  if (utxos[0].amount > outputs[0].amount) {
    return utxos[0];
  }
  // Max Number of UTXOS Accepted = 2

  selection.fee = 0;
  selection.outputs = outputs;
  selection.inputs = utxos;
  return selection;
};
