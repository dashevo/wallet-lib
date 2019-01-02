const { duffsToDash } = require('../utils');
/**
 * Return the total balance of an account.
 * Expect parralel fetching/discovery to be activated.
 * @return {number} Balance in dash
 */
function getBalance(unconfirmed = true, displayDuffs = true) {
  const self = this;
  let totalSat = 0;
  const { walletId, storage } = this;
  const { addresses } = storage.getStore().wallets[walletId];
  const subwallets = Object.keys(addresses);
  subwallets.forEach((subwallet) => {
    const paths = Object.keys(self.store.wallets[walletId].addresses[subwallet]);
    paths.forEach((path) => {
      const address = self.store.wallets[walletId].addresses[subwallet][path];
      const { unconfirmedBalanceSat, balanceSat } = address;
      totalSat += (unconfirmed) ? unconfirmedBalanceSat + balanceSat : balanceSat;
    });
  });

  return (displayDuffs) ? totalSat : duffsToDash(totalSat);
}
module.exports = getBalance;