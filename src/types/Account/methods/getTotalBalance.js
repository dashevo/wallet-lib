const { duffsToDash } = require('../../../utils');

/**
 * Return the total balance of an account (confirmed + unconfirmed).
 * @param displayDuffs {boolean} True by default. Set the returned format : Duff/dash.
 * @return {number} Balance in dash
 */
function getTotalBalance(displayDuffs = true) {
  const {
    walletId, storage, index,
  } = this;
  const totalSat = storage.calculateDuffBalance(walletId, index, 'total');
  return (displayDuffs) ? totalSat : duffsToDash(totalSat);
}

module.exports = getTotalBalance;
