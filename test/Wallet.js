const { expect } = require('chai');
const Dashcore = require('@dashevo/dashcore-lib');
const Mnemonic = require('@dashevo/dashcore-mnemonic');
const { Wallet } = require('../src/index');
const { mnemonicString1, invalidMnemonicString1 } = require('./fixtures.json');

const mnemonic1 = new Mnemonic(mnemonicString1);
const privateHDKey1 = mnemonic1.toHDPrivateKey('', 'testnet');

let walletTestnet = null;

describe('Wallet', () => {
  it('should create a wallet from a HDPrivateKey', () => {
    const network = 'testnet';
    const config = {
      seed: privateHDKey1,
      network,
    };
    const wallet = new Wallet(config);
    // eslint-disable-next-line no-unused-expressions
    expect(wallet).to.exist;
    expect(wallet).to.be.a('object');
    expect(wallet.constructor.name).to.equal('Wallet');
    expect(wallet.transport).to.equal(null);
    expect(wallet.HDPrivateKey.toString()).to.equal(privateHDKey1.toString());
  });
  it('should create a wallet from a mnemonic string', () => {
    const network = Dashcore.Networks.testnet;
    const config = {
      mnemonic: mnemonicString1,
      network,
    };
    const wallet = new Wallet(config);
    const hdKey = mnemonic1.toHDPrivateKey('', network);
    // eslint-disable-next-line no-unused-expressions
    expect(wallet).to.exist;
    expect(wallet).to.be.a('object');
    expect(wallet.constructor.name).to.equal('Wallet');
    expect(wallet.transport).to.equal(null);
    expect(wallet.HDPrivateKey.toString()).to.equal(hdKey.toString());
  });
  it('should create a wallet from a mnemonic object', () => {
    const network = Dashcore.Networks.testnet;
    const config = {
      mnemonic: mnemonic1,
      network,
    };
    const wallet = new Wallet(config);
    const hdKey = mnemonic1.toHDPrivateKey('', network);
    // eslint-disable-next-line no-unused-expressions
    expect(wallet).to.exist;
    expect(wallet).to.be.a('object');
    expect(wallet.constructor.name).to.equal('Wallet');
    expect(wallet.transport).to.equal(null);
    expect(wallet.HDPrivateKey.toString()).to.equal(hdKey.toString());
  });
  it('should create a wallet when mnemonic not set', () => {
    const network = Dashcore.Networks.testnet;
    const config = {
      network,
    };
    const wallet = new Wallet(config);
    // eslint-disable-next-line no-unused-expressions
    expect(wallet).to.exist;
    expect(wallet).to.be.a('object');
    expect(wallet.constructor.name).to.equal('Wallet');
    expect(wallet.transport).to.equal(null);
    expect(wallet.mnemonic).to.be.an.instanceof(Mnemonic);
  });
  it('should be able to create a wallet', () => {
    const wallet = new Wallet({
      mnemonic: mnemonicString1,
      network: Dashcore.Networks.testnet,
    });

    const acc1 = wallet.createAccount({ mode: 'light' });
    const acc2 = wallet.createAccount({ mode: 'light' });
    const acc3 = wallet.createAccount({ mode: 'light' });

    [acc1, acc2, acc3].forEach((el, i) => {
      // eslint-disable-next-line no-unused-expressions
      expect(el).to.exist;
      expect(el).to.be.a('object');
      expect(el.constructor.name).to.equal('Account');
      expect(el.BIP44PATH).to.equal(`m/44'/1'/${i}'`);
    });
  });
  it('should reject without network', () => {
    const conf = {
      mnemonic: mnemonic1,
    };
    expect(() => new Wallet(conf)).to.throw('Expected a valid network (typeof Network or String');
  });
  it('should reject with invalid mnemonic: true', () => {
    const conf = {
      mnemonic: true,
      network: Dashcore.Networks.testnet,
    };
    expect(() => new Wallet(conf)).to.throw('Expected a valid mnemonic (typeof String or Mnemonic)');
  });
  it('should reject with invalid mnemonic: false', () => {
    const conf = {
      mnemonic: false,
      network: Dashcore.Networks.testnet,
    };
    expect(() => new Wallet(conf)).to.throw('Expected a valid mnemonic (typeof String or Mnemonic)');
  });
  it('should reject with invalid mnemonic: 0', () => {
    const conf = {
      mnemonic: false,
      network: Dashcore.Networks.testnet,
    };
    expect(() => new Wallet(conf)).to.throw('Expected a valid mnemonic (typeof String or Mnemonic)');
  });
  it('should reject with invalid seed: true', () => {
    const network = 'testnet';
    const conf = {
      seed: true,
      network,
    };
    expect(() => new Wallet(conf)).to.throw('Expected a valid seed (typeof HDPrivateKey or String)');
  });
  it('should reject with invalid seed: false', () => {
    const network = 'testnet';
    const conf = {
      seed: false,
      network,
    };
    expect(() => new Wallet(conf)).to.throw('Expected a valid seed (typeof HDPrivateKey or String)');
  });
  it('should reject with invalid seed: 0', () => {
    const network = 'testnet';
    const conf = {
      seed: 0,
      network,
    };
    expect(() => new Wallet(conf)).to.throw('Expected a valid seed (typeof HDPrivateKey or String)');
  });


  it('should reject invalid mnemonic', () => {
    const conf = {
      mnemonic: invalidMnemonicString1,
      network: Dashcore.Networks.testnet,
    };
    expect(() => new Wallet(conf)).to.throw('Mnemonic string is invalid: knife easily prosper input concert merge prepare autumn pen blood glance chair');
  });
  it('should be able to export to a HDPrivKey', () => {
    const network = Dashcore.Networks.testnet;
    const config = {
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
      mnemonic: mnemonic1,
      network,
    };
    walletTestnet = new Wallet(config);
    const exported = walletTestnet.exportWallet();
    expect(exported).to.equal(mnemonicString1);
  });
  it('should be able to export to a HDPrivKey with seed', () => {
    const network = 'testnet';
    const config = {
      seed: privateHDKey1,
      network,
    };
    walletTestnet = new Wallet(config);
    const exported = walletTestnet.exportWallet(true);
    expect(exported).to.deep.equal(privateHDKey1);
  });
  it('should not be able to export with seed', () => {
    const network = 'testnet';
    const config = {
      seed: privateHDKey1,
      network,
    };
    walletTestnet = new Wallet(config);
    expect(() => walletTestnet.exportWallet()).to.throw('Wallet was not initiated with a mnemonic, can\'t export it');
  });
  it('should encrypt wallet with a passphrase', () => {
    const network = Dashcore.Networks.testnet;
    const passphrase = 'Evolution';
    const config = {
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
    // eslint-disable-next-line no-unused-expressions
    expect(account).to.exist;
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
