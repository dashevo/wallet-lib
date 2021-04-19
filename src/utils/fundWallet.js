const waitForTransaction = require('./waitForTransaction');

/**
 *
 * @param {Wallet} faucetWallet
 * @param {Wallet} recipientWallet
 * @param {number} amount
 * @return {Promise<void>}
 */
async function fundWallet(faucetWallet, recipientWallet, amount) {
  const faucetAccount = await faucetWallet.getAccount();
  const recipientAccount = await recipientWallet.getAccount();

  const faucetBalance = faucetAccount.getTotalBalance();
  if(faucetBalance < amount){
    const {address: faucetAddress} = faucetAccount.getAddress(0);
    throw new Error(`Faucet ${faucetAddress} balance (${faucetBalance}) too low to perform funding of ${amount}`);
  }

  const transaction = await faucetAccount.createTransaction({
    satoshis: amount,
    recipient: recipientAccount.getAddress().address,
  });

  await Promise.all([
    faucetAccount.broadcastTransaction(transaction),
    waitForTransaction(recipientAccount, transaction.id),
  ]);

  return transaction.id;
}

module.exports = fundWallet;
