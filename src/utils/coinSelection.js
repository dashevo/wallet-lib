const { Script, Address } = require('@dashevo/dashcore-lib');
const feeCalculation = require('./feeCalculation');
const is = require('./../utils/is');

const getBytesOf = function getBytesOf(elem, type) {
  let BASE_BYTES = 0;
  let SCRIPT_BYTES = 0;

  switch (type) {
    case 'utxo':
      BASE_BYTES = 32 + 4 + 1 + 4;
      SCRIPT_BYTES = elem.scriptPubKey.length;
      return BASE_BYTES + SCRIPT_BYTES;
    case 'output':
      BASE_BYTES = 9;
      SCRIPT_BYTES = Script(new Address(elem.address)).toString().length;
      return BASE_BYTES + SCRIPT_BYTES;
    default:
      return false;
  }
};

const STRATEGIES = {
  simpleAccumulator(utxosList, outputsList) {
    let bytes = 0;
    let outValue = 0;

    outputsList.forEach((output) => {
      bytes += getBytesOf(output, 'output');
      outValue += output.satoshis;
    });
    const selection = {
      utxos: [],
    };

    for (let i = 0; i < utxosList.length; i += 1) {
      const utxo = utxosList[i];
      const utxoBytes = getBytesOf(utxo, 'utxo');
      const utxoFee = 10000 * utxoBytes;
      const utxoValue = utxo.satoshis;

      // We already have over the amount, let's continue up to the last element
      if (utxoValue > outValue + utxoFee) {
        selection.utxos = [utxo];
        selection.utxosValue = utxoValue;
      } else {
        // We can't go further, then if we did found element before let's return it
        const foundBefore = !!selection.utxos.length;
        if (foundBefore) {
          return selection;
        }
      }
    }

    selection.utxos = [];
    selection.utxosValue = 0;

    // We didn't fetch using a first solution, so now we will accumulate in group of utxos
    for (let i = 0; i < utxosList.length; i += 1) {
      const utxo = utxosList[i];
      const utxoBytes = getBytesOf(utxo, 'utxo');
      const utxoFee = 10000 * utxoBytes;
      const utxoValue = utxo.satoshis;

      selection.utxos.push(utxo);
      selection.utxosValue += utxoValue;

      // We already have over the amount, let's continue up to the last element
      if (selection.utxosValue > outValue + utxoFee) {
        return selection;
      }
    }

    throw new Error('Dit not found any utxo, missing implementation of this case');
  },
};


module.exports = function coinSelection(utxosList, outputsList, strategyName = 'simpleAccumulator', feeRate = feeCalculation()) {
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

  const feeValueGuesstimate = 10000;// Guesstimated value (avg tx)
  if (utxosValue < outputValue + feeValueGuesstimate) {
    throw new Error('Unsufficient input value in the utxosList to met output target');
  }

  return STRATEGIES[strategyName](utxosList, outputsList);
};
