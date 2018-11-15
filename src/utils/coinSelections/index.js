const is = require('../../utils/is');
const STRATEGIES = require('./strategies');
const { InvalidUTXO, InvalidOutput, CoinSelectionUnsufficientUTXOS } = require('../../errors');

module.exports = function coinSelection(utxosList, outputsList, deductFee = false, feeCategory = 'normal', strategyName = 'simpleAccumulator') {
  if (!utxosList) { throw new Error('A txosList is required'); }
  if (utxosList.constructor.name !== 'Array') { throw new Error('utxosList must be an array of utxos'); }
  if (utxosList.length < 1) { throw new Error('utxosList must contain at least 1 utxo'); }
  let utxosValue = 0;
  utxosList.forEach((utxo) => {
    if (!is.utxo(utxo)) {
      throw new InvalidUTXO(utxo);
    }
    utxosValue += utxo.satoshis;
  });


  if (!outputsList) { throw new Error('An outputsList is required in order to perform a selection'); }
  if (outputsList.constructor.name !== 'Array') { throw new Error('outputsList must be an array of outputs'); }
  if (outputsList.length < 1) { throw new Error('outputsList must contains at least 1 output'); }

  let outputValue = 0;
  outputsList.forEach((output) => {
    if (!is.output(output)) {
      throw new InvalidOutput(output);
    }
    outputValue += output.satoshis;
  });
  if (utxosValue < outputValue) {
    throw new CoinSelectionUnsufficientUTXOS({ utxosValue, outputValue });
  }

  return STRATEGIES[strategyName](utxosList, outputsList, deductFee, feeCategory);
};
