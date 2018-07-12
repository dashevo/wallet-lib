const { expect } = require('chai');
const Dashcore = require('@dashevo/dashcore-lib');
const Mnemonic = require('@dashevo/dashcore-mnemonic');
const DAPIClient = require('@dashevo/dapi-sdk').Api;
const { Wallet } = require('../src/index');
const { mnemonicString1 } = require('./fixtures.json');

const mnemonic1 = new Mnemonic(mnemonicString1);
const dapiClient = new DAPIClient();

describe('Wallet', () => {
  it('should create a wallet from a private hd key', () => {
    const network = 'testnet';
    const privateHDKey1 = mnemonic1.toHDPrivateKey(network);

    const config = {
      transport: dapiClient,
      seed: privateHDKey1,
      network,
    };
    const wallet = new Wallet(config);

    expect(wallet).to.exist;
    expect(wallet).to.be.a('object');
    expect(wallet.constructor.name).to.equal('Wallet');
    expect(wallet.transport).to.equal(dapiClient);
    expect(wallet.HDPrivateKey.toString()).to.equal(privateHDKey1.toString());
    expect(wallet.synced).to.equal(false);
    expect(wallet).to.have.property('events');
  });
  it('should create a wallet from a mnemonic string', () => {
    const network = Dashcore.Networks.testnet;
    const config = {
      transport: dapiClient,
      mnemonic: mnemonicString1,
      network,
    };
    const wallet = new Wallet(config);
    const hdKey = mnemonic1.toHDPrivateKey(network);

    expect(wallet).to.exist;
    expect(wallet).to.be.a('object');
    expect(wallet.constructor.name).to.equal('Wallet');
    expect(wallet.transport).to.equal(dapiClient);
    expect(wallet.HDPrivateKey.toString()).to.equal(hdKey.toString());
    expect(wallet.synced).to.equal(false);
    expect(wallet).to.have.property('events');
  });
  it('should create a wallet from a mnemonic object', () => {
    const network = Dashcore.Networks.testnet;
    const config = {
      transport: dapiClient,
      mnemonic: mnemonic1,
      network,
    };
    const wallet = new Wallet(config);
    const hdKey = mnemonic1.toHDPrivateKey(network);

    expect(wallet).to.exist;
    expect(wallet).to.be.a('object');
    expect(wallet.constructor.name).to.equal('Wallet');
    expect(wallet.transport).to.equal(dapiClient);
    expect(wallet.HDPrivateKey.toString()).to.equal(hdKey.toString());
    expect(wallet.synced).to.equal(false);
    expect(wallet).to.have.property('events');
  });
  it('should be able to create a wallet', () => {
    const wallet = new Wallet({
      transport: dapiClient,
      mnemonic: mnemonicString1,
      network: Dashcore.Networks.testnet,
    });

    const acc1 = wallet.createAccount();
    const acc2 = wallet.createAccount();
    const acc3 = wallet.createAccount();

    [acc1, acc2,acc3].forEach((el, i) => {
      expect(el).to.exist;
      expect(el).to.be.a('object');
      expect(el.constructor.name).to.equal('Account');
      expect(el.BIP44PATH).to.equal(`m/44'/1'/0'/${i}`);
    });
  });
});
