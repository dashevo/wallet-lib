const { expect } = require('chai');
const { Wallet } = require('../src/index');
const { Account } = require('../src/index');
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
  fakeTransportTestnet: {
    network: 'testnet',
    mnemonic: mnemonicString2,
  },
  fakeTransportLivenet: {
    network: 'livenet',
    mnemonic: mnemonicString2,
  },
};
const walletTestnet = new Wallet(walletConfigs.testnet);
const walletLivenet = new Wallet(walletConfigs.livenet);
const walletFakeTransportTestnet = new Wallet(walletConfigs.fakeTransportTestnet);
const walletFakeTransportLivenet = new Wallet(walletConfigs.fakeTransportLivenet);

describe('Account', () => {
  it('should create an account using testnet network', () => {
    const accountTestnet = walletTestnet.createAccount({ mode: 'light' }); // Should derivate
    // eslint-disable-next-line no-unused-expressions
    expect(accountTestnet).to.exist;
    expect(accountTestnet).to.be.a('object');
    expect(accountTestnet.constructor.name).to.equal('Account');
    expect(accountTestnet.BIP44PATH).to.equal('m/44\'/1\'/0\'');
  });
  it('should create an account using livenet network', () => {
    const accountLivenet = walletLivenet.createAccount({ mode: 'light' }); // Should derivate
    // eslint-disable-next-line no-unused-expressions
    expect(accountLivenet).to.exist;
    expect(accountLivenet).to.be.a('object');
    expect(accountLivenet.constructor.name).to.equal('Account');
    expect(accountLivenet.BIP44PATH).to.equal('m/44\'/5\'/0\'');
  });
  it('should be able to create an account with wallet', () => {
    const accountTestnet = new Account(walletTestnet, { mode: 'light' });
    // eslint-disable-next-line no-unused-expressions
    expect(accountTestnet).to.exist;
    expect(accountTestnet).to.be.a('object');
    expect(accountTestnet.constructor.name).to.equal('Account');
    expect(accountTestnet.BIP44PATH).to.equal('m/44\'/1\'/1\'');
  });
  it('should be able to setup a label', () => {
    const label = 'MyUberLabel';
    const account = walletTestnet.createAccount({
      label,
    });
    expect(account.label).to.equal(label);
  });

  it('should be able to derivate an address for testnet', () => {
    const accountTestnet = walletFakeTransportTestnet.createAccount();
    const addressData = accountTestnet.getAddress(0, true);
    expect(addressData).to.have.property('address');
    const { address, path } = addressData;
    expect(address).to.equal('yizmJb63ygipuJaRgYtpWCV2erQodmaZt8');
    expect(path).to.equal('m/44\'/1\'/0\'/0/0');

    const addressDataInternal = accountTestnet.getAddress(0, false);
    expect(addressDataInternal.address).to.equal('yjSivd8eWH1vVywaeePiHBLXqMbHFXxxXE');

    const addressDataExternal = accountTestnet.getAddress(10);
    expect(addressDataExternal.address).to.equal('yPetUJo1WeAjLpNYACntNSgEvHuUu3p1a8');
  });
  it('should be able to derivate an address for livenet', () => {
    const accountLivenet = walletFakeTransportLivenet.createAccount();
    const addressData = accountLivenet.getAddress(0, true);
    expect(addressData).to.have.property('address');
    const { address } = addressData;
    expect(address).to.equal('Xc1u8mcXcRm7GAHtFvYXYnPR8L6cqVkoyp');

    const addressDataInternal = accountLivenet.getAddress(0, false);
    expect(addressDataInternal.address).to.equal('XcqD6TFCcQ7jvcNiuohFFxBmwP2n71tANy');

    const addressDataExternal = accountLivenet.getAddress(10);
    expect(addressDataExternal.address).to.equal('XfPKRskw2vDXKpJ11oZZdQBjSMocJ5jmes');
  });

  it('should be able to get all address', () => {
    const account = walletFakeTransportTestnet.getAccount(0);
    const addressesExternalData = account.getAddresses();
    const externalDataKeys = Object.keys(addressesExternalData);
    expect(externalDataKeys.length).to.equal(20);

    const addressesInternalData = account.getAddresses(false);
    const internalDataKeys = Object.keys(addressesInternalData);
    expect(internalDataKeys.length).to.equal(20);
  });
  it('should be able to get a unused address', () => {
    const account = walletFakeTransportTestnet.getAccount(0);
    const unusedAddress = account.getUnusedAddress();
    expect(unusedAddress.path).to.equal('m/44\'/1\'/0\'/0/0');
    expect(unusedAddress.index).to.equal('0');// TODO : why would index even be a string...
    expect(unusedAddress.address).to.equal('yizmJb63ygipuJaRgYtpWCV2erQodmaZt8');
  });
  it('should be able to fetch UTXO from an amount', () => {
    const account = walletFakeTransportTestnet.createAccount();
    const utxos = account.getUTXOS();
    expect(utxos).to.deep.equal([]);
    // Fetch also unavailable utxos
    const allUtxos = account.getUTXOS(false);
    expect(allUtxos).to.deep.equal([]);
  });
  it('should be able to prepare a transaction', () => {

  });
  it('should not be able to create an account without wallet', () => {
    expect(() => new Account()).to.throw('Expected wallet to be created and passed as param');
  });
  it('should not be able to generate an address without path', () => {
    const accountTestnet = new Account(walletTestnet, { mode: 'light' });
    expect(() => accountTestnet.generateAddress()).to.throw('Expected path to generate an address');
  });
});
// let hdPrivKey = this.state.config.rootPrivKey.derive(walletPath);
