const { expect } = require('chai');
const Dashcore = require('@dashevo/dashcore-lib');
const getUnusedAddress = require('./getUnusedAddress');
const getAddress = require('./getAddress');
const generateAddress = require('./generateAddress');
const KeyChain = require('../../KeyChain/KeyChain');
const KeyChainStore = require("../../KeyChainStore/KeyChainStore");
const mockAccountWithStorage = require("../../../test/mocks/mockAccountWithStorage");

const HDRootKeyMockedStore = 'tprv8gpcZgdXPzdXKBjSzieMyfwr6KidKucLiiA9VbCLCx1spyJNd38a5KdjtVuc9bVUNpFM2LdFCrYSyUXHx1RCTdr6qQen1HTECwAZ1p8yqiB';

describe('Account - getUnusedAddress', function suite() {
  this.timeout(10000);
  let mockedAccount;

  before(() => {
    mockedAccount = mockAccountWithStorage({
      keyChainStore: new KeyChainStore()
    })

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
