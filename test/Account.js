const { expect } = require('chai');
const Dashcore = require('@dashevo/dashcore-lib');
const Mnemonic = require('@dashevo/dashcore-mnemonic');
const { Wallet } = require('../src/index');
const { mnemonicString1 } = require('./fixtures.json');

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

};
const walletTestnet = new Wallet(walletConfigs.testnet);
const walletLivenet = new Wallet(walletConfigs.livenet);

describe('Account', () => {
  it('should create an account using testnet network', () => {
    const accountTestnet = walletTestnet.createAccount(); // Should derivate
    expect(accountTestnet).to.exist;
    expect(accountTestnet).to.be.a('object');
    expect(accountTestnet.constructor.name).to.equal('Account');
    expect(accountTestnet.BIP44PATH).to.equal('m/44\'/1\'/0\'/0');
  });
  it('should create an account using livenet network', () => {
    const accountLivenet = walletLivenet.createAccount(); // Should derivate
    expect(accountLivenet).to.exist;
    expect(accountLivenet).to.be.a('object');
    expect(accountLivenet.constructor.name).to.equal('Account');
    expect(accountLivenet.BIP44PATH).to.equal('m/44\'/5\'/0\'/0');
  });
});
