const { expect } = require('chai');
const importAccounts = require('../../src/Storage/importAccounts');
const Wallet = require('../../src/Wallet/Wallet');

describe('Storage - importAccounts', () => {
  it('should throw on failed import', () => {
    const mockOpts1 = { };
    const walletId = '123ae';
    const exceptedException1 = 'Expected walletId to import addresses';

    expect(() => importAccounts.call({})).to.throw(exceptedException1);
    expect(() => importAccounts.call({}, walletId)).to.throw(exceptedException1);
  });
  it('should create a wallet if not existing', () => {
    const wallet = new Wallet();
    const acc = wallet.getAccount();
    let called = 0;

    const self = {
      searchWallet: () => ({ found: false }),
      createWallet: () => (called += 1),
      store: { wallets: {  } },
    };
    self.store.wallets[wallet.walletId] = {accounts: {}};
    importAccounts.call(self, acc, wallet.walletId);
    expect(called).to.be.equal(1);
  });
  it('should import an account', () => {
    const wallet = new Wallet();
    const acc = wallet.getAccount();

    const self = {
      searchWallet: () => ({ found: false }),
    };
    importAccounts.call(self, acc, wallet.walletId);

    console.log(self);
    // const self = {};
    // const acc = wallet.ge();
    // console.log(acc);
    // console.log(wallet)
    // importAddress.call(self, {});
    // console.log(self);
  });
});
