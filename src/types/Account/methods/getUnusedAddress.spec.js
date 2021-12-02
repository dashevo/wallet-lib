const { expect } = require('chai');
const Dashcore = require('@dashevo/dashcore-lib');
const getUnusedAddress = require('./getUnusedAddress');
const getAddress = require('./getAddress');
const generateAddress = require('./generateAddress');
const KeyChain = require('../../KeyChain/KeyChain');

// const mockedStore = require('../../../../fixtures/duringdevelop-fullstore-snapshot-1548538361');
const walletStoreMock = require('../../../../fixtures/wallets/c922713eac.json');
const chainStoreMock = require('../../../../fixtures/chains/for_wallet_c922713eac.json');
const KeyChainStore = require("../../KeyChainStore/KeyChainStore");
const Storage = require("../../Storage/Storage");

const HDRootKeyMockedStore = 'tprv8gpcZgdXPzdXKBjSzieMyfwr6KidKucLiiA9VbCLCx1spyJNd38a5KdjtVuc9bVUNpFM2LdFCrYSyUXHx1RCTdr6qQen1HTECwAZ1p8yqiB';

describe('Account - getUnusedAddress', function suite() {
  this.timeout(10000);
  let mockedAccount;

  before(() => {
    const { walletId } = walletStoreMock;

    mockedAccount = {
      emit: (_) => (_),
      walletId,
      index: 0,
      storage: new Storage(),
      accountPath: "m/44'/1'/0'",
      network: "testnet",
      keyChainStore: new KeyChainStore()
    };

    mockedAccount.storage.createWalletStore(walletId)
    mockedAccount.storage.createChainStore("testnet")
    mockedAccount.storage.getWalletStore(walletId).importState(walletStoreMock)
    mockedAccount.storage.getChainStore("testnet").importState(chainStoreMock)

    const keyChain = new KeyChain({
      type: 'HDPrivateKey',
      HDPrivateKey: Dashcore.HDPrivateKey(HDRootKeyMockedStore),
      lookAheadOpts: {
        paths: {
          'm/0': 20,
          'm/1': 60,
        },
      }
    });

    mockedAccount.keyChainStore.addKeyChain(keyChain, { isMasterKeyChain: true });

    mockedAccount.getAddress = getAddress.bind(mockedAccount);
    mockedAccount.generateAddress = generateAddress.bind(mockedAccount);
  })

  it('should get the proper unused address', () => {
    const unusedAddressExternal = getUnusedAddress.call(mockedAccount);
    const unusedAddressInternal = getUnusedAddress.call(mockedAccount, 'internal');

    expect(unusedAddressExternal).to.be.deep.equal({
      address: 'ycuRYGdNudwRxKNDQBqHDW7aGbJU6uqhXo',
      index: 1,
      path: 'm/0/1'
    });

    expect(unusedAddressInternal).to.be.deep.equal({
      address: 'ybPPRHGDK6HUjAapixJaHjpFrBP7p1eNHX',
      path: 'm/1/40',
      index: 40
    });
  });
});
