const { each } = require('lodash');
const TransactionSyncStreamWorker = require('../../plugins/Workers/TransactionSyncStreamWorker/TransactionSyncStreamWorker');
const ChainPlugin = require('../../plugins/Plugins/ChainPlugin');
const IdentitySyncWorker = require('../../plugins/Workers/IdentitySyncWorker');
const { WALLET_TYPES } = require('../../CONSTANTS');

const preparePlugins = (account, userUnsafePlugins) => {
  const plugins = [];

  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      if (account.injectDefaultPlugins) {
        if (!account.offlineMode) {
          plugins.push([ChainPlugin, true]);
          plugins.push([TransactionSyncStreamWorker, true]);

          if (account.walletType === WALLET_TYPES.HDWALLET) {
            plugins.push([IdentitySyncWorker, true]);
          }
        }
      }
      each(userUnsafePlugins, (UnsafePlugin) => {
        if(UnsafePlugin.dependencies){
          console.log({dependencies: UnsafePlugin.dependencies})
        }
        account.injectPlugin(UnsafePlugin, account.allowSensitiveOperations);
      });

      resolve(plugins);
    } catch (e) {
      reject(e);
    }
  });
};
module.exports = preparePlugins;
