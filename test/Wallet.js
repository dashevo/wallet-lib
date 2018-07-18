const { expect } = require('chai');
const Dashcore = require('@dashevo/dashcore-lib');
const Mnemonic = require('@dashevo/dashcore-mnemonic');
const DAPIClient = require('@dashevo/dapi-sdk').Api;
const { Wallet } = require('../src/index');
const { mnemonicString1, invalidMnemonicString1 } = require('./fixtures.json');

const mnemonic1 = new Mnemonic(mnemonicString1);
const privateHDKey1 = mnemonic1.toHDPrivateKey('', 'testnet');

const dapiClient = new DAPIClient();
let walletTestnet = null;

describe('Wallet', () => {
  it('should create a wallet from a HDPrivateKey', () => {
    const network = 'testnet';
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
  });
  it('should create a wallet from a mnemonic string', () => {
    const network = Dashcore.Networks.testnet;
    const config = {
      transport: dapiClient,
      mnemonic: mnemonicString1,
      network,
    };
    const wallet = new Wallet(config);
    const hdKey = mnemonic1.toHDPrivateKey('', network);
    expect(wallet).to.exist;
    expect(wallet).to.be.a('object');
    expect(wallet.constructor.name).to.equal('Wallet');
    expect(wallet.transport).to.equal(dapiClient);
    expect(wallet.HDPrivateKey.toString()).to.equal(hdKey.toString());
  });
  it('should create a wallet from a mnemonic object', () => {
    const network = Dashcore.Networks.testnet;
    const config = {
      transport: dapiClient,
      mnemonic: mnemonic1,
      network,
    };
    const wallet = new Wallet(config);
    const hdKey = mnemonic1.toHDPrivateKey('', network);

    expect(wallet).to.exist;
    expect(wallet).to.be.a('object');
    expect(wallet.constructor.name).to.equal('Wallet');
    expect(wallet.transport).to.equal(dapiClient);
    expect(wallet.HDPrivateKey.toString()).to.equal(hdKey.toString());
  });
  it('should be able to create a wallet', () => {
    const wallet = new Wallet({
      transport: dapiClient,
      mnemonic: mnemonicString1,
      network: Dashcore.Networks.testnet,
    });

    const acc1 = wallet.createAccount({ mode: 'light' });
    const acc2 = wallet.createAccount({ mode: 'light' });
    const acc3 = wallet.createAccount({ mode: 'light' });

    [acc1, acc2, acc3].forEach((el, i) => {
      expect(el).to.exist;
      expect(el).to.be.a('object');
      expect(el.constructor.name).to.equal('Account');
      expect(el.BIP44PATH).to.equal(`m/44'/1'/${i}'`);
    });
  });
  it('should reject invalid mnemonic', () => {
    const conf = {
      transport: dapiClient,
      mnemonic: invalidMnemonicString1,
      network: Dashcore.Networks.testnet,
    };
    expect(() => new Wallet(conf)).to.throw('Mnemonic string is invalid: knife easily prosper input concert merge prepare autumn pen blood glance chair');
  });
  it('should be able to export to a HDPrivKey', () => {
    const network = Dashcore.Networks.testnet;
    const config = {
      transport: dapiClient,
      mnemonic: mnemonic1,
      network,
    };
    walletTestnet = new Wallet(config);
    const exported = walletTestnet.exportWallet(true);
    expect(exported).to.deep.equal(privateHDKey1);
  });
  it('should be able to export a mnemonic', () => {
    const network = Dashcore.Networks.testnet;
    const config = {
      transport: dapiClient,
      mnemonic: mnemonic1,
      network,
    };
    walletTestnet = new Wallet(config);
    const exported = walletTestnet.exportWallet();
    expect(exported).to.equal(mnemonicString1);
  });
  it('should encrypt wallet with a passphrase', () => {
    const network = Dashcore.Networks.testnet;
    const passphrase = 'Evolution';
    const config = {
      transport: dapiClient,
      mnemonic: mnemonic1,
      passphrase,
      network,
    };
    walletTestnet = new Wallet(config);
    const encryptedHDPriv = walletTestnet.exportWallet(true);
    const expectedHDPriv = 'tprv8ZgxMBicQKsPd5PxuGP2oSibQ3uXZBVBYePFjZmVSz5urXdyoJSzsZq9SrTDNRE5e5n3FnRMWDbt4foEJejiDCGooDBu7GSajSonqDcdazh';
    expect(encryptedHDPriv.toString()).to.equal(expectedHDPriv);
  });
  it('should be able to create an account at a specific index', () => {
    const account = walletTestnet.createAccount();
    const accountSpecificIndex = walletTestnet.createAccount({ accountIndex: 42 });
    expect(accountSpecificIndex.BIP44PATH.split('/')[3]).to.equal('42\'');
    expect(accountSpecificIndex.accountIndex).to.equal(42);
  });
  it('should be able to get an account at a specific index', () => {
    const account = walletTestnet.getAccount();
    expect(account.accountIndex).to.equal(0);

    const nonAlreadyCreatedAccount = walletTestnet.getAccount(41);

    expect(nonAlreadyCreatedAccount.accountIndex).to.equal(41);

    const accountSpecific = walletTestnet.getAccount(42);
    expect(accountSpecific.accountIndex).to.equal(42);

    expect(walletTestnet.accounts.length).to.equal(3);
  });
});
