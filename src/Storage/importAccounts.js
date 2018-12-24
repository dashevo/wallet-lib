/**
 * Import an array of accounts or a account object to the store
 * @param accounts
 * @param walletId
 * @return {boolean}
 */
const importAccounts = function (accounts, walletId) {
  const type = accounts.constructor.name;
  if (!walletId) throw new Error('Expected walletId to import addresses');
  if (!this.searchWallet(walletId).found) {
    this.createWallet(walletId);
  }
  const accList = this.store.wallets[walletId].accounts;

  if (type === 'Object') {
    if (accounts.path) {
      if (!accList[accounts.path]) {
        accList[accounts.path] = accounts;
        this.lastModified = +new Date();
      }
    } else {
      const accountsPaths = Object.keys(accounts);
      accountsPaths.forEach((path) => {
        const el = accounts[path];
        if (el.path) {
          if (!accList[el.path]) {
            accList[el.path] = el;
            this.lastModified = +new Date();
          }
        }
      });
    }
  } else if (type === 'Array') {
    throw new Error('Not implemented. Please create an issue on github if needed.');
  } else {
    throw new Error('Invalid account. Cannot import.');
  }
  return true;
};
module.exports = importAccounts;
