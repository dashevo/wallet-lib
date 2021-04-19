const EVENTS = require('../EVENTS');
/**
 *
 * @param {Account} account
 * @param {number} blockNumberToWait
 * @return {Promise<boolean>}
 */
module.exports = async function waitForBlocks(account, blockNumberToWait = 1) {
  let waitedBlock = 0;
  // Subscribe to block with a faster rate
  await account.transport.subscribeToBlocks(10 * 1000);

  return new Promise((resolve) => {
    const listener = () => {
      waitedBlock += 1;
      if (waitedBlock >= blockNumberToWait) {
        account.removeListener(EVENTS.BLOCK, listener);
        resolve(true);
      }
    };

    account.on(EVENTS.BLOCK, listener);
  });
};
