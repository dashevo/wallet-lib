const { each, findIndex } = require('lodash');
const TransactionSyncStreamWorker = require('../../plugins/Workers/TransactionSyncStreamWorker/TransactionSyncStreamWorker');
const ChainPlugin = require('../../plugins/Plugins/ChainPlugin');
const IdentitySyncWorker = require('../../plugins/Workers/IdentitySyncWorker');
const { WALLET_TYPES } = require('../../CONSTANTS');

const initPlugin = (UnsafePlugin) => {
  const isInit = !(typeof UnsafePlugin === 'function');
  return (isInit) ? UnsafePlugin : new UnsafePlugin();
};

const sortUserPlugins = (defaultSortedPlugins, userUnsafePlugins) => {
  const sortedPlugins = [];
  const initializedSortedPlugins = [];

  each(defaultSortedPlugins, (defaultPluginParams) => {
    sortedPlugins.push(defaultPluginParams);

    // We also need to initialize them so we actually as we gonna need to read some properties.
    const plugin = initPlugin(defaultPluginParams[0]);
    initializedSortedPlugins.push(plugin);
  });

  each(userUnsafePlugins, (UnsafePlugin) => {
    const plugin = initPlugin(UnsafePlugin);

    const { pluginDependencies } = plugin;
    const hasPluginDependencies = !!(pluginDependencies && pluginDependencies.length);

    let lastDependencyIndex = -1;
    if (hasPluginDependencies) {
      each(pluginDependencies, (pluginDependencyName) => {
        const pluginDependencyIndex = findIndex(initializedSortedPlugins, ['name', pluginDependencyName]);
        if (lastDependencyIndex < pluginDependencyIndex) {
          lastDependencyIndex = pluginDependencyIndex;
        }
        if (pluginDependencyIndex === -1) {
          // This will throw if user has defined the plugin but we didn't processed it yet.
          // We could process that by delaying and retry after that,
          // complexity of such would exist in case of cross-dependency
          // For now we just implement the naive way to handle dependency, but adding a TODO here.
          // Let's note : We will still want to throw after retrying if we still fail
          // to sort the concerned plugin (to avoid looping forever and ever)
          throw new Error(`Plugin ${plugin.name} has missing dependency ${pluginDependencyName}`);
        }
      });
    }

    // We insert both initialized and uninitialized plugins as we gonna need to read property.
    initializedSortedPlugins.splice(
      (lastDependencyIndex >= 0) ? lastDependencyIndex + 1 : initializedSortedPlugins.length,
      0,
      plugin,
    );
    sortedPlugins.splice(
      (lastDependencyIndex >= 0) ? lastDependencyIndex + 1 : initializedSortedPlugins.length,
      0,
      [UnsafePlugin, true],
    );
  });
  each(initializedSortedPlugins, (initializedSortedPlugin, i) => {
    delete initializedSortedPlugins[i];
  });
  return sortedPlugins;
};
const sortPlugins = (account, userUnsafePlugins) => {
  const plugins = [];

  // eslint-disable-next-line no-async-promise-executor
  if (account.injectDefaultPlugins) {
    if (!account.offlineMode) {
      plugins.push([ChainPlugin, true]);
      plugins.push([TransactionSyncStreamWorker, true]);

      if (account.walletType === WALLET_TYPES.HDWALLET) {
        plugins.push([IdentitySyncWorker, true]);
      }
    }
  }
  return sortUserPlugins(plugins, userUnsafePlugins);
};
module.exports = sortPlugins;
