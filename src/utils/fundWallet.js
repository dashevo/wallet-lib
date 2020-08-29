const { PrivateKey } = require('@dashevo/dashcore-lib');

const EVENTS = require('../EVENTS');

/**
 *
 * @param {Account} walletAccount
 * @param {string} id - transaction id
 * @return {Promise<string>}
 */
function waitForTransaction(walletAccount, id) {
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
}

/**
 *
 * @param {Wallet} faucetWallet
 * @param {Wallet} recipientWallet
 * @param {number} amount
 * @param {Object} [options]
 * @param {boolean} [options.mineBlock=false]
 * @param {boolean} [options.isRegtest=false]
 * @return {Promise<void>}
 */
async function fundWallet(faucetWallet, recipientWallet, amount, options = {}) {
  // eslint-disable-next-line no-param-reassign
  options = {
    mineBlock: false,
    ...options,
  };

  if (options.mineBlock) {
    const privateKey = new PrivateKey();

    await faucetWallet.transport.client.core.generateToAddress(
      1,
      privateKey.toAddress(faucetWallet.network).toString(),
    );
  }

  if (options.isRegtest) {
    const initialHeight = await faucetWallet.transport.getBestBlockHeight();
    let height = initialHeight;
    while (initialHeight + 101 > height) {
      const privateKey = new PrivateKey();

      // eslint-disable-next-line no-await-in-loop
      await faucetWallet.transport.client.core.generateToAddress(
        100,
        privateKey.toAddress(faucetWallet.network).toString(),
      );
      // eslint-disable-next-line no-await-in-loop
      height = await faucetWallet.transport.getBestBlockHeight();
    }
  }

  const faucetAccount = await faucetWallet.getAccount();
  const recipientAccount = await recipientWallet.getAccount();

  const transaction = await faucetAccount.createTransaction({
    satoshis: amount,
    recipient: recipientAccount.getAddress().address,
  });

  let blockPromise;

  await faucetAccount.broadcastTransaction(transaction);

  if (options.mineBlock) {
    const privateKey = new PrivateKey();

    blockPromise = faucetWallet.transport.client.core.generateToAddress(
      1,
      privateKey.toAddress(faucetWallet.network).toString(),
    );
  }

  return Promise.all([
    waitForTransaction(recipientAccount, transaction.id),
    blockPromise,
  ]);
}

module.exports = fundWallet;
