const { expect } = require('chai');
const mockedStore = require('../fixtures/sirentonight-fullstore-snapshot-1562711703');
const getTotalBalance = require('../../src/Account/getTotalBalance');
const getConfirmedBalance = require('../../src/Account/getConfirmedBalance');
const getUnconfirmedBalance = require('../../src/Account/getUnconfirmedBalance');


let mockedWallet;
describe('Account - getTotalBalance', () => {
  before(() => {
    const storageHDW = {
      store: mockedStore,
      getStore: () => mockedStore,
      mappedAddress: {},
    };
    const walletId = Object.keys(mockedStore.wallets)[0];
    mockedWallet = Object.assign({
      walletId,
      accountIndex: 0,
      storage: storageHDW,
    });
  });
  it('should correctly get the balance', async () => {
    const balance = await getTotalBalance.call(mockedWallet);
    expect(balance).to.equal(184499999506);
  });
  it('should correctly get the balance confirmed only', async () => {
    const balance = await getConfirmedBalance.call(mockedWallet);
    expect(balance).to.equal(184499999506);
  });
  it('should correctly get the balance dash value instead of duff', async () => {
    const balanceUnconfDash = await getUnconfirmedBalance.call(mockedWallet,false);
    const balanceConfDash = await getConfirmedBalance.call(mockedWallet, false);

    expect(balanceUnconfDash).to.equal(1844.99999506);
    expect(balanceConfDash).to.equal(1844.99999506);
  });
});
