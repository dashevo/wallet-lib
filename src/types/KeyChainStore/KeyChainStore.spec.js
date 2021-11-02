const {HDPrivateKey} = require("@dashevo/dashcore-lib");
const KeyChainsStore = require('./KeyChainStore');
const KeyChain = require("../KeyChain/KeyChain");
const { expect } = require('chai');

describe('KeyChainStore', function suite() {
  let keyChainsStore;
  let hdPrivateKey = new HDPrivateKey()
  let keyChain = new KeyChain(hdPrivateKey)
  it('should create a KeyChainStore', () => {
    keyChainsStore = new KeyChainsStore();
    expect(keyChainsStore).to.exist;
    expect(keyChainsStore.chains).to.be.a('Map')
  });
  it('should be able to add a keyChain', function () {
    keyChainsStore.addKeyChain(keyChain)
    expect(keyChainsStore.chains.has(keyChain.keyChainId)).to.equal(true);
  });
  it('should get all keyChains', function () {
    const keyChains = keyChainsStore.getKeyChains()
    expect(keyChains).to.deep.equal([keyChain]);
  });
});

