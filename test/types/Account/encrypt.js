const { expect } = require('chai');
const CryptoJS = require('crypto-js');
const { Wallet } = require('../../../src');

const derivationPath = "m/44'/1'/0'/0";

describe('Account - encrypt', () => {
  let wallet;
  let account;
  beforeEach(() => {
    wallet = new Wallet();
    account = wallet.getAccount(0);
  });

  afterEach(() => {
    wallet.disconnect();
  });

  it('should encrypt extPubKey', () => {
    const secret = 'secret';
    const extPubKey = account.keyChain.getKeyForPath(derivationPath, 'HDPublicKey');
    const encryptedExtPubKey = account.encrypt(extPubKey, secret);
    const bytes = CryptoJS.AES.decrypt(encryptedExtPubKey, secret);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    expect(decrypted).to.equal(extPubKey.toString());
  });
});
