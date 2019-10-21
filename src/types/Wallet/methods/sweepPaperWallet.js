module.exports = function sweepPaperWallet(privateKey) {
  const account = this.fromPrivateKey(privateKey).getAccount(0);
  const amount = account.getTotalBalance();
  const recipient = this.getAccount(0).getUnusedAddress().address;
  const tx = account.createTransaction({
    amount, recipient,
  });

  return account.broadcastTransaction(tx);
};
