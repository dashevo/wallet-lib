const EVENTS = require('../EVENTS');
/**
 *
 * @param {Account} walletAccount
 * @param {string} id - transaction id
 * @return {Promise<string>}
 */
module.exports = async function waitForTransaction(walletAccount, id) {
  return new Promise(((resolve) => {
    const listener = (event) => {
      const { payload: { transaction } } = event;

      if (transaction.id === id) {
        walletAccount.removeListener(EVENTS.FETCHED_CONFIRMED_TRANSACTION, listener);

        resolve(transaction.id);
      }
    };

    walletAccount.on(EVENTS.FETCHED_CONFIRMED_TRANSACTION, listener);
  }));
};
