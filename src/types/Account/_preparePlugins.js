const sortPlugins = require('./_sortPlugins');

const preparePlugins = function preparePlugins(account, userUnsafePlugins) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      const sortedPlugins = sortPlugins(account, userUnsafePlugins);
      // eslint-disable-next-line no-restricted-syntax
      for (const [plugin, allowSensitiveOperation, awaitOnInjection] of sortedPlugins) {
        // eslint-disable-next-line no-await-in-loop
        await account.injectPlugin(plugin, allowSensitiveOperation, awaitOnInjection);
      }
      resolve(sortedPlugins);
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = preparePlugins;
