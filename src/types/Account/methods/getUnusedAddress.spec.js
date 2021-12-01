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

// const HDRootKeyMockedStore = 'tprv8ZgxMBicQKsPfEan1JB7NF4STbvnjGvP9318CN7FPGZp5nsUTBqmerxtDVpsJjFufyfkTgoe6QfHcDhMqjN3ZoFKtb8SnXFeubNjQreZSq6';
const HDRootKeyMockedStore = 'tprv8ZgxMBicQKsPedfdHYgWfJFn2Nu1p7Vr7AnsXRX9pAQsj83QmEv6S27Fd66o7opsMJsc1G8xMmAWXevKPAA7FSbziZ9cHyJoGpHXyDykR8g';

describe('Account - getUnusedAddress', function suite() {
  this.timeout(10000);
  let mockedWallet;

  before(() => {
    const { walletId } = walletStoreMock;

    mockedWallet = {
      emit: (_) => (_),
      walletId,
      index: 0,
      storage: new Storage(),
      accountPath: "m/44'/1'/0'",
      network: "testnet",
      keyChainStore: new KeyChainStore()
    };

    mockedWallet.storage.createWalletStore(walletId)
    mockedWallet.storage.createChainStore("testnet")
    mockedWallet.storage.getWalletStore(walletId).importState(walletStoreMock)
    mockedWallet.storage.getChainStore("testnet").importState(chainStoreMock)

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

    mockedWallet.keyChainStore.addKeyChain(keyChain, { isMasterKeyChain: true });


    mockedWallet.getAddress = getAddress.bind(mockedWallet);
    mockedWallet.generateAddress = generateAddress.bind(mockedWallet);
  })

  it('should get the proper unused address', () => {
    // const unusedAddressExternal = getUnusedAddress.call(mockedWallet);
    const unusedAddressInternal = getUnusedAddress.call(mockedWallet, 'internal');

    console.log(unusedAddressInternal)

    // ybPPRHGDK6HUjAapixJaHjpFrBP7p1eNHX

    // expect(unusedAddressExternal).to.be.deep.equal({
    //   address: 'yaVrJ5dgELFkYwv6AydDyGPAJQ5kTJXyAN',
    //   balanceSat: 0,
    //   fetchedLast: 1548538385006,
    //   path: 'm/44\'/1\'/0\'/0/5',
    //   transactions: [],
    //   unconfirmedBalanceSat: 0,
    //   utxos: {},
    //   used: false,
    // });
    // expect(unusedAddressInternal).to.be.deep.equal({
    //   address: 'yaZFt1VnAbi72mtyjDNV4AwTECqdg5Bv95',
    //   balanceSat: 0,
    //   fetchedLast: 1548538385164,
    //   path: 'm/44\'/1\'/0\'/1/8',
    //   transactions: [],
    //   unconfirmedBalanceSat: 0,
    //   utxos: {},
    //   used: false,
    // });
  });
});
