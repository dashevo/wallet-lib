const is = require('../../utils/is');
const STRATEGIES = require('./strategies');
module.exports = function coinSelection(utxosList, outputsList, deductFee = false, feeCategory = 'normal', strategyName = 'simpleAccumulator' ) {
  if (!utxosList) { throw new Error('Require a utxosList to select from'); }
  if (utxosList.constructor.name !== 'Array') { throw new Error('Require utxosList to be an array of utxos'); }
  if (utxosList.length < 1) { throw new Error('Require utxosList to contains at least 1 utxo'); }
  let utxosValue = 0;
  utxosList.forEach((utxo) => {
    if (!is.utxo(utxo)) {
      throw new Error(`Invalid utxo in utxosList ${JSON.stringify(utxo)}`);
    }
    utxosValue += utxo.satoshis;
  });


  if (!outputsList) { throw new Error('Require a outputsList to perform a selection for'); }
  if (outputsList.constructor.name !== 'Array') { throw new Error('Require outputsList to be an array of outputs'); }
  if (outputsList.length < 1) { throw new Error('Require outputsList to contains at least 1 output'); }

  let outputValue = 0;
  outputsList.forEach((output) => {
    if (!is.output(output)) {
      throw new Error(`Invalid output in outputsList ${JSON.stringify(output)}`);
    }
    outputValue += output.satoshis;
  });

  return STRATEGIES[strategyName](utxosList, outputsList, deductFee, feeCategory);
};
