const { expect } = require('chai');
const { DAPIClient } = require('@dashevo/dapi-sdk');
const { HDPrivateKey } = require('@dashevo/dashcore-lib');
const { createWallet } = require('../src/index');

describe('Wallet', () => {
  it('should create a wallet', () => {
    const dapiClient = new DAPIClient({ port: 3010 });
    const privateHDKey = new HDPrivateKey();
    const wallet = createWallet(dapiClient, privateHDKey);

    expect(wallet).to.be.a('object');
    expect(wallet.DAPIClient).to.equal(dapiClient);
    expect(wallet.privateHDKey).to.equal(privateHDKey);
    expect(wallet.synced).to.equal(false);
    expect(wallet).to.have.property('events');
  });
});
