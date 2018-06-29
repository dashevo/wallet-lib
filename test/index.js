const { expect } = require('chai');
const { DAPIClient } = require('@dashevo/dapi-sdk');
const { HDPrivateKey } = require('@dashevo/dashcore-lib');
const { createWallet, getNewAddress } = require('../src/index');
const Mnemonic = require('@dashevo/dashcore-mnemonic');

const mnemonic1 = 'knife easily prosper input concert merge prepare autumn pen blood glance toilet';
const dapiClient = new DAPIClient({ port: 3010 });
const mnemonic = new Mnemonic(mnemonic1).toSeed();
const privateHDKey = new HDPrivateKey.fromSeed(mnemonic);

describe('Wallet', () => {
  it('should create a wallet from a privateHDKey', () => {
    const wallet = createWallet(dapiClient, privateHDKey);

    expect(wallet).to.be.a('object');
    expect(wallet.DAPIClient).to.equal(dapiClient);
    expect(wallet.privateHDKey).to.equal(privateHDKey);
    expect(wallet.synced).to.equal(false);
    expect(wallet).to.have.property('events');
  });
  it('should create a wallet from a mnemonic', () => {
    const wallet = createWallet(dapiClient, mnemonic1);

    expect(wallet).to.be.a('object');
    expect(wallet.DAPIClient).to.equal(dapiClient);
    expect(wallet.synced).to.equal(false);
    expect(wallet).to.have.property('privateHDKey');
    expect(wallet).to.have.property('events');
  });

  it('should generate an address', () => {
    const wallet = createWallet(dapiClient, privateHDKey);
    const address = getNewAddress(wallet);
  });
});
