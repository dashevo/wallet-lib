// simpleAccumulator stuff commented
// Read before delete








// const accState = Object.assign({}, accumulator);
// accState.fees.category = feeCategory;
// accState.fees.deductFee = deductFee;
// accState.utxos.available = sortedList.length;
// accState.utxos.list = sortedList;
// accState.outputs.list = outputsList;

//
// accState.addOutputs(outputs);

// const { outputBytes, outputValue } = calculateOutputsSizeAndValue(outputsList);
// accState.outputs.size = outputBytes;
// accState.outputs.valueOut =outputValue;
//
// console.log('======SIMPLE ACCUMATOR======');
// console.log('Original state', state);
//
// if(deductFee) deductFeeFromOutputs(state, outputs);
// const estimatedOutputsFee = estimateFee(feeCategory, outputBytes);
//
// result.fees.outputFee = estimatedOutputsFee;
// console.log('Estimate outputs fee', state);



// if(deductFee){
//Already substract the amount from our last output
// let output = outputsList[outputsList.length-1];
// output.satoshis -= estimatedOutputsFee;
// }
// const selection = getSimpleSelectionOfUtxo(utxosList, feeCategory, deductFee);
// console.log('selection',selection);

//Try to find a selection of utxos to pay for the output


// const isDust = ( outputValue, estimatedFee ) => {
/*
The dust limit is modeled on a hypothetical transaction with one input and one output, and which unlocks its unspent output with a pay-to-public-key-hash (P2PKH) response script. The dust limit is 3 times the relay fee for this transaction.
more : https://www.reddit.com/r/Bitcoin/comments/2unzen/what_is_bitcoins_dust_limit_precisely/coadpz8/
*/
//  return false;
// return ( outputValue/3 < estimatedFee)
// };


// if(isDust(outputValue, estimatedFee)){
//Apply different
// }
//   const outputFee = FEES.NORMAL * (outputBytes/1000);

//   const selection = {
//     utxos: [],
//   };
//   for (let i = 0; i < utxosList.length; i += 1) {
//     const utxo = utxosList[i];
//     const utxoBytes = getBytesOf(utxo, 'utxo');

//     const utxoFee = (deductFee) ? 0 : FEES.DEFAULT_FEE * utxoBytes;
//     const utxoValue = utxo.satoshis;

//     // We already have over the amount, let's continue up to the last element
//     if (utxoValue > outputValue + utxoFee) {
//       selection.utxos = [utxo];
//       selection.utxosValue = utxoValue;
//     } else {
//       // We can't go further, then if we did found element before let's return it
//       const foundBefore = !!selection.utxos.length;
//       if (foundBefore) {
//         return selection;
//       }
//     }
//   }

//   selection.utxos = [];
//   selection.utxosValue = 0;

//   // We didn't fetch using a first solution, so now we will accumulate in group of utxos
//   for (let i = 0; i < utxosList.length; i += 1) {
//     const utxo = utxosList[i];
//     const utxoBytes = getBytesOf(utxo, 'utxo');
//     const utxoFee = 10000 * utxoBytes;
//     const utxoValue = utxo.satoshis;

//     selection.utxos.push(utxo);
//     selection.utxosValue += utxoValue;

//     // We already have over the amount, let's continue up to the last element
//     if (selection.utxosValue > outputValue + utxoFee + outputFee && selection.utxos.length <= 25) {
//       return selection;
//     }else {
//       const missingSat = selection.utxosValue - (outputValue + utxoFee + outputFee);
//       console.log(selection.utxosValue, outputFee)
//       throw new Error(`Not enought utxosValue to pay for fees, missing :${missingSat}`);
//       console.log(selection.utxosValue, outputValue, utxoFee, outputFee, selection.utxos.length)
//     }
//   }