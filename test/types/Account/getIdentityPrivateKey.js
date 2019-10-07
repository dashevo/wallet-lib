const { expect } = require('chai');

const { Account, Wallet } = require('../../../src');
const mockedStore = require('../../fixtures/sirentonight-fullstore-snapshot-1562711703');

const storageHDW = {
  store: mockedStore,
  getStore: () => mockedStore,
  mappedAddress: {},
};
const walletId = Object.keys(mockedStore.wallets)[0];
const walletMock = {
  walletId,
  accountIndex: 0,
  storage: storageHDW,
};
const accountMock = new Account(walletMock, { injectDefaultPlugins: false });

describe('Account - getIdentityPrivateKey', () => {
  let keychain;
  const mnemonic = 'during develop before curtain hazard rare job language become verb message travel';
  const pk = '4226d5e2fe8cbfe6f5beb7adf5a5b08b310f6c4a67fc27826779073be6f5699e';
  it('should create a keychain', () => {
    const expectedException1 = 'Expect privateKey, HDPublicKey or HDPrivateKey';
    expect(() => new KeyChain()).to.throw(expectedException1);
    expect(() => new KeyChain(mnemonic)).to.throw(expectedException1);

    keychain = new KeyChain({ HDPrivateKey: mnemonicToHDPrivateKey(mnemonic, 'testnet') });
    expect(keychain.type).to.equal('HDPrivateKey');
    expect(keychain.network.toString()).to.equal('testnet');
    expect(keychain.keys).to.deep.equal({});
  });
  it('should get private key', () => {
    expect(keychain.getPrivateKey().toString()).to.equal(pk);
  });
});
