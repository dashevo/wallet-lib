const { expect } = require('chai');
const walletStoreMock = require('../../../../fixtures/wallets/c922713eac.json');
const chainStoreMock = require('../../../../fixtures/chains/for_wallet_c922713eac.json');
const getTotalBalance = require('./getTotalBalance');
const getConfirmedBalance = require('./getConfirmedBalance');
const getUnconfirmedBalance = require('./getUnconfirmedBalance');
const Storage = require("../../Storage/Storage");


let mockedAccount;
describe('Account - getTotalBalance', function suite() {
  this.timeout(10000);
  before(() => {
    const { walletId } = walletStoreMock;

    mockedAccount = {
      walletId,
      index: 0,
      storage: new Storage(),
      accountPath: "m/44'/1'/0'",
      network: "testnet"
    };

    mockedAccount.storage.createWalletStore(walletId)
    mockedAccount.storage.createChainStore("testnet")
    mockedAccount.storage.getWalletStore(walletId).importState(walletStoreMock)
    mockedAccount.storage.getChainStore("testnet").importState(chainStoreMock)
  });
  it('should correctly get the balance',  () => {
    const balance = getTotalBalance.call(mockedAccount);
    expect(balance).to.equal(224108673);
  });
  it('should correctly get the balance confirmed only',  () => {
    const balance = getConfirmedBalance.call(mockedAccount);
    expect(balance).to.equal(224108673);
  });
  it('should correctly get the balance dash value instead of duff',  () => {
    const balanceTotalDash = getTotalBalance.call(mockedAccount, false);
    const balanceUnconfDash = getUnconfirmedBalance.call(mockedAccount, false);
    const balanceConfDash = getConfirmedBalance.call(mockedAccount, false);

    expect(balanceTotalDash).to.equal(2.24108673);
    expect(balanceUnconfDash).to.equal(0);
    expect(balanceConfDash).to.equal(2.24108673);
  });
});
