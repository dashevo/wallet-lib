const logger = require('../../../logger');

module.exports = function sweepPaperWallet(privateKey) {
  return new Promise((resolve, reject) => {
    try {
      const paperWallet = new this.constructor({ privateKey });
      const account = paperWallet.getAccount(0);
      account.events.on('ready', async () => {
        const amount = account.getTotalBalance();
        logger.info('Paper wallet balance', amount);
        const recipient = this.getAccount(0).getUnusedAddress().address;
        const tx = account.createTransaction({
          amount, recipient,
        });

        const result = await account.broadcastTransaction(tx);
        resolve(result);
      });
    } catch (err) {
      logger.error('sweepPaperWallet', err);
      reject(err);
    }
  });
};
