module.exports = sortAndVerifyUTXOS = (utxosList) => {
  return utxosList.sort((a, b) => b.satoshis - a.satoshis);
}
