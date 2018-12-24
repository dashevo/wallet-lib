/**
 * Add when not existing a element account in a parent wallet
 * @param account
 * @param wallet
 */
const addAccountToWallet = function (account, wallet) {
  const { accounts } = wallet;

  const existAlready = accounts.filter(el => el.accountIndex === wallet.accountIndex).length > 0;
  if (!existAlready) {
    wallet.accounts.push(account);
  }
};
module.exports = addAccountToWallet;