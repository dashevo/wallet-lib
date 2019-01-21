/**
 * Get a specific account per accountIndex
 * @param accountIndex - Default: 0, set a specific index to get
 * @param accountOpts - If the account doesn't exist yet, we create it passing these options
 * @return {*|account}
 */
function getAccount(accountIndex = 0, accountOpts) {
  const acc = this.accounts.filter(el => el.accountIndex === accountIndex);
  const baseOpts = { accountIndex };

  const opts = Object.assign(baseOpts, accountOpts);
  const account = (acc[0]) || this.createAccount(opts);
  account.storage.attachEvents(account.events);
  return account;
}
module.exports = getAccount;
