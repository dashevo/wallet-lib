const { expect } = require('chai');
const Dashcore = require('@dashevo/dashcore-lib');
const Mnemonic = require('@dashevo/dashcore-mnemonic');
const { Wallet } = require('../src/index');
const { mnemonicString1, mnemonicString2 } = require('./fixtures.json');

// const seed1 = new Mnemonic(mnemonic1).toSeed();
// const dapiClient = 'placeholder';
// const network = 'testnet';
// const privateHDKey1 = new Dashcore.HDPrivateKey.fromSeed(seed1, Dashcore.Networks.testnet);
const walletConfigs = {
  testnet: {
    network: 'testnet',
    mnemonic: mnemonicString1,
  },
  livenet: {
    network: 'livenet',
    mnemonic: mnemonicString1,
  },
  fakeTransport: {
    network: 'testnet',
    mnemonic: mnemonicString2,
  },
};
const walletTestnet = new Wallet(walletConfigs.testnet);
const walletLivenet = new Wallet(walletConfigs.livenet);
const walletFakeTransport = new Wallet(walletConfigs.fakeTransport);

describe('Account', () => {
  it('should create an account using testnet network', () => {
    const accountTestnet = walletTestnet.createAccount(); // Should derivate
    expect(accountTestnet).to.exist;
    expect(accountTestnet).to.be.a('object');
    expect(accountTestnet.constructor.name).to.equal('Account');
    expect(accountTestnet.BIP44PATH).to.equal('m/44\'/1\'/0\'');
  });
  it('should create an account using livenet network', () => {
    const accountLivenet = walletLivenet.createAccount(); // Should derivate
    expect(accountLivenet).to.exist;
    expect(accountLivenet).to.be.a('object');
    expect(accountLivenet.constructor.name).to.equal('Account');
    expect(accountLivenet.BIP44PATH).to.equal('m/44\'/5\'/0\'');
  });
  it('should be able to setup a label', () => {
    const label = 'MyUberLabel';
    const account = walletTestnet.createAccount({
      label,
    });
    expect(account.label).to.equal(label);
  });
  it('should be able to fetch UTXO from an amount', () => {
    const account = walletFakeTransport.createAccount();
    // const utxos = account.getUTXO();
    // expect(utxos).to.equal({});
  });
  it('should be able to derivate an address', () => {
    const account = walletFakeTransport.createAccount();
    const addressData = account.getAddress(0, true);
    expect(addressData).to.have.property('address');
    const address = addressData.address;
    expect(address).to.equal('XeSreNYHbpdGik8mWdsHmDtNs7ZxuP1BPh');

    const addressDataInternal = account.getAddress(0, false);
    expect(addressDataInternal.address).to.equal('Xv85h8ghE5ov37PTqKCG5SDmqCCvUVbYF9');

    const addressDataExternal = account.getAddress(10);
    expect(addressDataExternal.address).to.equal('XiHQnw4ivadNUmuvfPVBpBdZ3ou5NcbC3t');
  });
  it('should be able to get all address', () => {
    const account = walletFakeTransport.getAccount(0);
    const addressesExternalData = account.getAddresses();
    // console.log(addressesExternalData);

    const addressesInternalData = account.getAddresses(false);
    // console.log(addressesInternalData);

  });
  it('should be able to prepare a transaction', () => {

  });
});
// let hdPrivKey = this.state.config.rootPrivKey.derive(walletPath);
