const { each } = require('lodash');
const sortPlugins = require('./_sortPlugins');

const preparePlugins = function (account, userUnsafePlugins) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      const sortedPlugins = sortPlugins(account, userUnsafePlugins);
      each(sortedPlugins, async (pluginArgs) => {
        const [plugin, allowSensitiveOperation, awaitOnInjection] = pluginArgs;
        await account.injectPlugin(plugin, allowSensitiveOperation, awaitOnInjection);
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = preparePlugins;
