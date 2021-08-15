function calculateTransactionFees(transaction) {
  const { inputs, outputs } = transaction;
  const inputAmount = inputs.reduce((acc, input) => (acc + input.satoshis), 0);
  const outputAmount = outputs.reduce((acc, output) => (acc + output.satoshis), 0);
  return transaction.isCoinbase() ? 0 : inputAmount - outputAmount;
}
module.exports = calculateTransactionFees;
