const { WALLET_TYPES } = require('../../../CONSTANTS');
const logger = require('../../../logger');
/**
 * This will sweep any paper wallet with remaining UTXOS to another Wallet created
 * via a random new mnemonic or via passed one.
 * Will resolves automatically network and transport.
 *
 * By default, the Wallet return is in offlineMode. And therefore sweep will be done
 * on the first address path. You can pass offlineMode:false to overwrite.
 *
 * @param {Wallet.Options} opts - Options to be passed to the wallet swept.
 * @return {Wallet} - Return a new random mnemonic created Wallet.
 */
async function sweepWallet(opts = {}) {
  return new Promise((resolve, reject) => {
    if (this.walletType !== WALLET_TYPES.SINGLE_ADDRESS) {
      reject(new Error('Can only sweep wallet initialized from privateKey'));
    }
    const account = this.getAccount({ index: 0 });
    const currentPublicAddress = account.getAddress(0).address;

    account.on('ready', async function () {
      const balance = await account.getTotalBalance();
      if (!balance > 0) {
        reject(new Error(`Cannot sweep an empty private key (current balance: ${balance})`));
      }
      try {
        const walletOpts = {
          offlineMode: true,
          network: this.network,
          transporter: this.transporter,
          ...opts,
        };
        const newWallet = new this.constructor(walletOpts);
        const recipient = newWallet.getAccount({ index: 0 }).getUnusedAddress().address;
        const tx = account.createTransaction({
          amount: balance,
          recipient,
        });
        const txid = await account.broadcastTransaction(tx);
        logger.info(`SweepWallet: ${balance} of ${currentPublicAddress} to ${recipient} transfered. Txid :${txid}`);

        return resolve(newWallet);
      } catch (err) {
        logger.error(`Failed to sweep wallet - ${err}`);
        reject(err);
      }
    });
  });
}
module.exports = sweepWallet;
