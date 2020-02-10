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
    const account = this.getAccount({index:0});
    const currentPublicAddress = account.getAddress(0).address;

    account.events.on('ready', async () => {
      const balance = await account.getTotalBalance();
      if (!balance > 0) {
        reject(new Error(`Cannot sweep an empty private key (current balance: ${balance})`));
      }
      const newWallet = new this.constructor({
        network: this.network,
        allowSensitiveOperations: this.allowSensitiveOperations,
        injectDefaultPlugins: this.injectDefaultPlugins,
        transport: this.transport.transport,
      });
      const mnemonic = newWallet.exportWallet();
      const recipient = newWallet.getAccount({index:0}).getUnusedAddress().address;
      const tx = account.createTransaction({
        amount: balance,
        recipient,
      });
      logger.info(`Sweep paper wallet - Transfered ${balance} from ${currentPublicAddress} to ${recipient}`);
      return mnemonic;
    });
  });


  // return new Promise((resolve, reject) => {
  //   try {
  //     const paperWallet = new this.constructor({ privateKey });
  //     const account = paperWallet.getAccount({index:0});
  //     account.events.on('ready', async () => {
  //       const amount = account.getTotalBalance();
  //       logger.info('Paper wallet balance', amount);
  //       const recipient = this.getAccount({index:0}).getUnusedAddress().address;
  //       const tx = account.createTransaction({
  //         amount, recipient,
  //       });
  //
  //       const result = await account.broadcastTransaction(tx);
  //       resolve(result);
  //     });
  //   } catch (err) {
  //     logger.error('sweepPaperWallet', err);
  //     reject(err);
  //   }
  // });
}
module.exports = sweepWallet;
