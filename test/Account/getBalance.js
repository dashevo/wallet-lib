const { expect } = require('chai');
const mockedStore = require('../fixtures/sirentonight-fullstore-snapshot-1562711703');
const getBalance = require('../../src/Account/getBalance');


let mockedWallet;
describe('Account - getBalance', () => {
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
    const balance = await getBalance.call(mockedWallet);
    expect(balance).to.equal(184499999506);
  });
  it('should correctly get the balance confirmed only', async () => {
    const balance = await getBalance.call(mockedWallet, false);
    expect(balance).to.equal(184499999506);
  });
  it('should correctly get the balance dash value instead of duff', async () => {
    const balanceUnconfDash = await getBalance.call(mockedWallet, true, false);
    const balanceConfDash = await getBalance.call(mockedWallet, false, false);

    expect(balanceUnconfDash).to.equal(1844.99999506);
    expect(balanceConfDash).to.equal(1844.99999506);
  });
});
