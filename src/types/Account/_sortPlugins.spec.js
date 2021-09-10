const { expect } = require('chai');
const { WALLET_TYPES } = require('../../CONSTANTS');
const sortPlugins = require('./_sortPlugins');

const TransactionSyncStreamWorker = require('../../plugins/Workers/TransactionSyncStreamWorker/TransactionSyncStreamWorker');
const ChainPlugin = require('../../plugins/Plugins/ChainPlugin');
const IdentitySyncWorker = require('../../plugins/Workers/IdentitySyncWorker');

const Worker = require('./../../plugins/Worker');

class dummyWorker extends Worker {
  constructor() {
    super({
      name: 'dummyWorker',
    });
  }
}
class withoutPluginDependenciesWorker extends Worker {
  constructor() {
    super({
      name: 'withoutPluginDependenciesWorker',
    });
  }
}
const userDefinedWithoutPluginDependenciesPlugins = {
  "dummyWorker": dummyWorker,
  "withoutPluginDependenciesWorker": withoutPluginDependenciesWorker
};

class withSinglePluginDependenciesWorker extends Worker {
  constructor() {
    super({
      name: 'withSinglePluginDependenciesWorker',
      injectionOrder: {
        after: [
          'IdentitySyncWorker'
        ]
      }
    });
  }
}
const userDefinedWithSinglePluginDependenciesPlugins1 = {
  "dummyWorker": dummyWorker,
  "withSinglePluginDependenciesWorker": withSinglePluginDependenciesWorker
};

class withSingleInjectBeforePluginDependenciesWorker extends Worker {
  constructor() {
    super({
      name: 'withSingleInjectBeforePluginDependenciesWorker',
      injectionOrder: {
        before: [
          'IdentitySyncWorker'
        ]
      }
    });
  }
}
const userDefinedWithSingleInjectBeforePluginDependenciesPlugins1 = {
  "dummyWorker": dummyWorker,
  "withSingleInjectBeforePluginDependenciesWorker": withSingleInjectBeforePluginDependenciesWorker
};
class withSinglePluginAndSingleInjectBeforeDependenciesWorker extends Worker {
  constructor() {
    super({
      name: 'withSinglePluginAndSingleInjectBeforeDependenciesWorker',
      injectionOrder: {
        after: [
          'ChainPlugin'
        ],
        before: [
          'TransactionSyncStreamWorker'
        ]
      }
    });
  }
}
const userDefinedWithSinglePluginAndSingleInjectBeforeDependenciesWorker = {
  "dummyWorker": dummyWorker,
  "withSinglePluginAndSingleInjectBeforeDependenciesWorker": withSinglePluginAndSingleInjectBeforeDependenciesWorker
};

class withSinglePluginDependenciesWorker2 extends Worker {
  constructor() {
    super({
      name: 'withSinglePluginDependenciesWorker2',
      injectionOrder: {
        before: [
          'TransactionSyncStreamWorker'
        ]
      }
    });
  }
}

const userDefinedWithSinglePluginDependenciesPlugins2 = {
  "dummyWorker": dummyWorker,
  "withSinglePluginDependenciesWorker2": withSinglePluginDependenciesWorker2
};

const userDefinedWithMultiplePluginDependenciesPlugins = {
  "dummyWorker": dummyWorker,
  "withSinglePluginDependenciesWorker": withSinglePluginDependenciesWorker,
  "withSinglePluginDependenciesWorker2": withSinglePluginDependenciesWorker2
};


class userDefinedConflictingDependenciesWorker extends Worker {
  constructor() {
    super({
      name: 'userDefinedConflictingDependenciesWorker',
      injectionOrder: {
        before: [
            'ChainPlugin'
        ],
        after: [
          'TransactionSyncStreamWorker',
        ]
      }
    });
  }
}


const userDefinedConflictingDependencies = {
  "dummyWorker": dummyWorker,
  "userDefinedConflictingDependenciesWorker": userDefinedConflictingDependenciesWorker,

}

class pluginWithMultiplePluginDependencies extends Worker {
  constructor() {
    super({
      name: 'pluginWithMultiplePluginDependencies',
      injectionOrder: {
        before: [
          'TransactionSyncStreamWorker',
          'withSinglePluginDependenciesWorker'
        ]
      }
    });
  }
}

const userDefinedComplexPluginDependenciesPlugins = {
  "dummyWorker": dummyWorker,
  "pluginWithMultiplePluginDependencies": pluginWithMultiplePluginDependencies,
  "withSinglePluginDependenciesWorker": withSinglePluginDependenciesWorker,

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
        [dummyWorker, true],
        [withoutPluginDependenciesWorker, true],
      ]);
    });

    it('should handle userDefinedWithSinglePluginDependenciesPlugins1', async function () {
      const sortedPlugins = await sortPlugins(accountOnlineWithDefaultPlugins, userDefinedWithSinglePluginDependenciesPlugins1);
      expect(sortedPlugins).to.deep.equal([
        [ChainPlugin, true],
        [TransactionSyncStreamWorker, true],
        [IdentitySyncWorker, true],
        [withSinglePluginDependenciesWorker, true],
        [dummyWorker, true],
      ])
    });
    it('should handle userDefinedWithSinglePluginDependenciesPlugins1', async function () {
      const sortedPlugins = await sortPlugins(accountOnlineWithDefaultPlugins, userDefinedWithSingleInjectBeforePluginDependenciesPlugins1);
      expect(sortedPlugins).to.deep.equal([
        [ChainPlugin, true],
        [TransactionSyncStreamWorker, true],
        [withSingleInjectBeforePluginDependenciesWorker, true],
        [IdentitySyncWorker, true],
        [dummyWorker, true],
      ])
    });

    it('should handle userDefinedWithSinglePluginDependenciesPlugins2', async function () {
      const sortedPlugins = await sortPlugins(accountOnlineWithDefaultPlugins, userDefinedWithSinglePluginDependenciesPlugins2);
      expect(sortedPlugins).to.deep.equal([
        [ChainPlugin, true],
        [withSinglePluginDependenciesWorker2 , true],
        [TransactionSyncStreamWorker, true],
        [IdentitySyncWorker, true],
        [dummyWorker, true],
      ])
    });

    it('should handle withSinglePluginAndSingleInjectBeforeDependenciesWorker', function () {
      const sortedPlugins = sortPlugins(accountOnlineWithDefaultPlugins, userDefinedWithSinglePluginAndSingleInjectBeforeDependenciesWorker);
      expect(sortedPlugins).to.deep.equal([
        [ChainPlugin, true],
        [withSinglePluginAndSingleInjectBeforeDependenciesWorker , true],
        [TransactionSyncStreamWorker, true],
        [IdentitySyncWorker, true],
        [dummyWorker, true],
      ])
    });

    it('should handle userDefinedWithMultiplePluginDependenciesPlugins', async function () {
      const sortedPlugins = await sortPlugins(accountOnlineWithDefaultPlugins, userDefinedWithMultiplePluginDependenciesPlugins);
      expect(sortedPlugins).to.deep.equal([
        [ChainPlugin, true],
        [withSinglePluginDependenciesWorker2 , true],
        [TransactionSyncStreamWorker, true],
        [IdentitySyncWorker, true],
        [withSinglePluginDependenciesWorker , true],
        [dummyWorker, true],
      ]);
    });
    it('should handle userDefinedConflictingDependencies', function () {
      expect(()=> sortPlugins(accountOnlineWithDefaultPlugins, userDefinedConflictingDependencies))
          .to
          .throw('Conflicting dependency order for userDefinedConflictingDependenciesWorker');
    });
    it('should handle userDefinedComplexPluginDependenciesPlugins', async function () {
      // TODO: User specified wrongly sorted plugins with deps is not yet handled.
      // rejecting with error for now.
      expect(()=> sortPlugins(accountOnlineWithDefaultPlugins, userDefinedComplexPluginDependenciesPlugins))
          .to
          .throw('Dependency withSinglePluginDependenciesWorker not found');
      // const sortedPlugins = await sortPlugins(accountOnlineWithDefaultPlugins, userDefinedComplexPluginDependenciesPlugins);
      // expect(sortedPlugins).to.deep.equal([
      //   [ChainPlugin, true],
      //   [TransactionSyncStreamWorker, true],
      //   [IdentitySyncWorker, true],
      //   [dummyWorker, true],
      //   [withSinglePluginDependenciesWorker, true],
      //   [pluginWithMultiplePluginDependencies, true],
      // ])
    });
  });
});