const { expect } = require('chai');
const { Wallet } = require('../../../../src');

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

  it('should decrypt extPubKey with aes', () => {
    const secret = 'secret';
    const extPubKey = account.keyChain.getKeyForPath(derivationPath, 'HDPublicKey').toString();
    const encryptedExtPubKey = account.encrypt('aes', extPubKey, secret).toString();
    const decryptedExtPubKey = account.decrypt('aes', encryptedExtPubKey, secret);
    expect(decryptedExtPubKey).to.equal(extPubKey);
  });
});
