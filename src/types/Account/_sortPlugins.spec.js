const { expect } = require('chai');
const { WALLET_TYPES } = require('../../CONSTANTS');
const sortPlugins = require('./_sortPlugins');

const TransactionSyncStreamWorker = require('../../plugins/Workers/TransactionSyncStreamWorker/TransactionSyncStreamWorker');
const ChainPlugin = require('../../plugins/Plugins/ChainPlugin');
const IdentitySyncWorker = require('../../plugins/Workers/IdentitySyncWorker');

const Worker = require('./../../plugins/Worker');
class withoutPluginDependenciesWorker extends Worker {
  constructor() {
    super({
      name: 'withoutPluginDependenciesWorker',
    });
  }
}
class withSinglePluginDependenciesWorker extends Worker {
  constructor() {
    super({
      name: 'withSinglePluginDependenciesWorker',
      pluginDependencies: [
        'IdentitySyncWorker'
      ]
    });
  }
}
class withSinglePluginDependenciesWorker2 extends Worker {
  constructor() {
    super({
      name: 'withSinglePluginDependenciesWorker2',
      pluginDependencies: [
        'TransactionSyncStreamWorker'
      ]
    });
  }
}
class pluginWithMultiplePluginDependencies extends Worker {
  constructor() {
    super({
      name: 'pluginWithMultiplePluginDependencies',
      pluginDependencies: [
        'TransactionSyncStreamWorker',
        'withSinglePluginDependenciesWorker'
      ]
    });
  }
}

const baseAccount = {
  walletType: WALLET_TYPES.HDWALLET
}
const accountOnlineWithDefaultPlugins = {
  ...baseAccount,
  injectDefaultPlugins: true,
};
const accountOnlineWithoutDefaultPlugins = {
  ...baseAccount,
  injectDefaultPlugins: false,
};
const accountOfflineWithDefaultPlugins = {
  ...baseAccount,
  offlineMode: true,
  injectDefaultPlugins: true,
};
const accountOfflineWithoutDefaultPlugins = {
  ...baseAccount,
  offlineMode: true,
  injectDefaultPlugins: false,
};
const userDefinedWithoutPluginDependenciesPlugins = {
  "withoutPluginDependenciesWorker": withoutPluginDependenciesWorker
};
const userDefinedWithSinglePluginDependenciesPlugins1 = {
  "withSinglePluginDependenciesWorker": withSinglePluginDependenciesWorker
};
const userDefinedWithSinglePluginDependenciesPlugins2 = {
  "withSinglePluginDependenciesWorker2": withSinglePluginDependenciesWorker2
};
const userDefinedWithMultiplePluginDependenciesPlugins = {
  "withSinglePluginDependenciesWorker": withSinglePluginDependenciesWorker,
  "withSinglePluginDependenciesWorker2": withSinglePluginDependenciesWorker2
};

// Subtility here is in the fact that the first plugin expect second as a dependency.
// It also expect TransactionSyncStreamWorker as a dependency.
// Second item expect IdentitySyncWorker as a dependency which is loaded after TXSyncStreamWorker
const userDefinedComplexPluginDependenciesPlugins = {
  "pluginWithMultiplePluginDependencies": pluginWithMultiplePluginDependencies,
  "withSinglePluginDependenciesWorker": withSinglePluginDependenciesWorker,

}

describe('Account - _sortPlugins', () => {
  describe('system plugins sorting', async function () {
    it('should be able to correctly sort default plugins', async function () {
      const sortedPluginsOnlineWithDefault = await sortPlugins(accountOnlineWithDefaultPlugins);
      expect(sortedPluginsOnlineWithDefault).to.deep.equal([
        [ChainPlugin, true],
        [TransactionSyncStreamWorker, true],
        [IdentitySyncWorker, true],
      ])
      const sortedPluginsOnlineWithoutDefault = await sortPlugins(accountOnlineWithoutDefaultPlugins);
      expect(sortedPluginsOnlineWithoutDefault).to.deep.equal([]);

      const sortedPluginsOfflineWithDefault = await sortPlugins(accountOfflineWithDefaultPlugins);
      expect(sortedPluginsOfflineWithDefault).to.deep.equal([])

      const sortedPluginsOfflineWithoutDefault = await sortPlugins(accountOfflineWithoutDefaultPlugins);
      expect(sortedPluginsOfflineWithoutDefault).to.deep.equal([])
    });
  });
  describe('user plugins sorting', async function () {
    it('should handle userDefinedWithoutPluginDependenciesPlugins', async function () {
      const sortedPlugins = await sortPlugins(accountOnlineWithDefaultPlugins, userDefinedWithoutPluginDependenciesPlugins);
      expect(sortedPlugins).to.deep.equal([
        [ChainPlugin, true],
        [TransactionSyncStreamWorker, true],
        [IdentitySyncWorker, true],
        [withoutPluginDependenciesWorker, true],
      ]);
    });
    it('should handle userDefinedWithoutPluginDependenciesPlugins', async function () {
      const sortedPlugins = await sortPlugins(accountOnlineWithDefaultPlugins, userDefinedWithSinglePluginDependenciesPlugins1);
      expect(sortedPlugins).to.deep.equal([
        [ChainPlugin, true],
        [TransactionSyncStreamWorker, true],
        [IdentitySyncWorker, true],
        [withSinglePluginDependenciesWorker, true]
      ])
    });
    it('should handle userDefinedWithSinglePluginDependenciesPlugins2', async function () {
      const sortedPlugins = await sortPlugins(accountOnlineWithDefaultPlugins, userDefinedWithSinglePluginDependenciesPlugins2);
      expect(sortedPlugins).to.deep.equal([
        [ChainPlugin, true],
        [TransactionSyncStreamWorker, true],
        [withSinglePluginDependenciesWorker2 , true],
        [IdentitySyncWorker, true],
      ])
    });
    it('should handle userDefinedWithMultiplePluginDependenciesPlugins', async function () {
      const sortedPlugins = await sortPlugins(accountOnlineWithDefaultPlugins, userDefinedWithMultiplePluginDependenciesPlugins);
      expect(sortedPlugins).to.deep.equal([
        [ChainPlugin, true],
        [TransactionSyncStreamWorker, true],
        [withSinglePluginDependenciesWorker2 , true],
        [IdentitySyncWorker, true],
        [withSinglePluginDependenciesWorker , true],
      ]);
    });
    it('should handle userDefinedComplexPluginDependenciesPlugins', async function () {
      expect(
          ()=>sortPlugins(accountOnlineWithDefaultPlugins, userDefinedComplexPluginDependenciesPlugins)
      ).to.throw(`Plugin pluginWithMultiplePluginDependencies has missing dependency withSinglePluginDependenciesWorker`);
      // const sortedPlugins = await sortPlugins(accountOnlineWithDefaultPlugins, userDefinedComplexPluginDependenciesPlugins);
      // expect(sortedPlugins).to.deep.equal([
        // [ChainPlugin, true],
        // [TransactionSyncStreamWorker, true],
        // [IdentitySyncWorker, true],
      // ])
    });
  });
});
