const {HDPrivateKey} = require("@dashevo/dashcore-lib");
const KeyChainsStore = require('./KeyChainStore');
const KeyChain = require("../KeyChain/KeyChain");
const { expect } = require('chai');

describe('KeyChainStore', function suite() {
  let keyChainsStore;
  let hdPrivateKey = new HDPrivateKey()
  let hdPublicKey = new HDPrivateKey().hdPublicKey
  let keyChain = new KeyChain(hdPrivateKey)
  let keyChainPublic = new KeyChain(hdPublicKey)
  let walletKeyChain = new KeyChain(new HDPrivateKey());
  it('should create a KeyChainStore', () => {
    keyChainsStore = new KeyChainsStore();
    expect(keyChainsStore).to.exist;
    expect(keyChainsStore.chains).to.be.a('Map')
  });
  it('should be able to add a keyChain', function () {
    keyChainsStore.addKeyChain(keyChain)
    expect(keyChainsStore.chains.has(keyChain.keyChainId)).to.equal(true);
    keyChainsStore.addKeyChain(keyChainPublic)
    expect(keyChainsStore.chains.has(keyChainPublic.keyChainId)).to.equal(true);
  });
  it('should allow to specify a specific wallet keychain', function () {
    keyChainsStore.addKeyChain(walletKeyChain, { isWalletKeyChain: true });
    expect(keyChainsStore.chains.has(walletKeyChain.keyChainId)).to.equal(true);
  });
  it('should get all keyChains', function () {
    const keyChains = keyChainsStore.getKeyChains()
    expect(keyChains).to.deep.equal([keyChain, keyChainPublic, walletKeyChain]);
  });
  it('should get a keychain by its ID', () => {
    const requestedKeychain = keyChainsStore.getKeyChain(keyChainPublic.keyChainId);
    expect(requestedKeychain).to.equal(keyChainPublic);
  })
  it('should get a wallet keychain', function () {
    const requestedWalletKeyChain = keyChainsStore.getWalletKeyChain();
    expect(requestedWalletKeyChain).to.equal(walletKeyChain);
  });
});

