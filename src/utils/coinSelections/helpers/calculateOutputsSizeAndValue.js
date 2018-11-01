const calculateOutputsSizeAndValue = (utxosList, feeCategory = 'normal', deductFee = false) =>{
  for (let i = 0; i < utxosList.length; i += 1) {
    const utxo = utxosList[i];
    //TODO : TX MODEL EST PAS BON, CHANGER LA METHODE DE CALCUL!
    const utxoBytes = getBytesOf(utxo, 'utxo');
    console.log('utxoBytes',utxoBytes);
    const utxoFee = (deductFee) ? 0 : FEES.DEFAULT_FEE * utxoBytes;
    const utxoValue = utxo.satoshis;

    // We already have over the amount, let's continue up to the last element
    if (utxoValue > outputValue + utxoFee) {
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
  return false;
};