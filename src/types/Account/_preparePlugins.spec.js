const { expect } = require('chai');
const { WALLET_TYPES } = require('../../CONSTANTS');

const preparePlugins = require('./_preparePlugins');

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
const userPlugins = {};
describe('Account - prepareDependencies', () => {
  it('should be able to load default plugins', async function () {
    const preparedPlugins = await preparePlugins(accountOnlineWithDefaultPlugins, userPlugins);
    console.log({preparedPlugins});
  });
  // it('should not load unneccessary plugins', function () {
  //   preparePlugins(accountWithoutDefaultPlugins, userPlugins);
  // });
});
