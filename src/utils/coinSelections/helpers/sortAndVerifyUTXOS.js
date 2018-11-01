const sortAndVerifyUTXOS = utxosList => utxosList.sort((a, b) => b.satoshis - a.satoshis);
module.exports = sortAndVerifyUTXOS;
