const { WALLET_TYPES } = require('../../../CONSTANTS');
const logger = require('../../../logger');
/**
 * This will sweep any paper wallet with remaining UTXOS
 */
async function sweepWallet() {
  return new Promise((resolve, reject) => {
    if (this.walletType !== WALLET_TYPES.SINGLE_ADDRESS) {
      reject(new Error('Can only sweep wallet initialized from privateKey'));
    }
    const account = this.getAccount({ index: 0 });
    const currentPublicAddress = account.getAddress(0).address;

    account.events.on('ready', async function () {
      const balance = await account.getTotalBalance();
      if (!balance > 0) {
        reject(new Error(`Cannot sweep an empty private key (current balance: ${balance})`));
      }
      try {
        const newWallet = new this.constructor({
          network: this.network,
          allowSensitiveOperations: this.allowSensitiveOperations,
          injectDefaultPlugins: this.injectDefaultPlugins,
          transport: this.transport.transport,
        });
        const mnemonic = newWallet.exportWallet();
        const recipient = newWallet.getAccount({ index: 0 }).getUnusedAddress().address;
        const tx = account.createTransaction({
          amount: balance,
          recipient,
        });
        const txid = await account.broadcastTransaction(tx);
        logger.info(`SweepWallet: ${balance} of ${currentPublicAddress} to ${recipient} transfered. Txid :${txid}`);

        return resolve(mnemonic);
      } catch (err) {
        logger.error(`Failed to sweep wallet - ${err}`);
        reject(err);
      }
    });
  });
}
module.exports = sweepWallet;
