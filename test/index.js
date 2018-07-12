const assert = require('assert');

const { getMasterKeyFromMnemonic } = require('../src');

describe('Wallet Library', () => {
  describe('getMasterKeyFromMnemonic', () => {
    it('should return a BIP32 root key given a BIP39 compliant mnemonic', () => {
      const expected = 'xprv9s21ZrQH143K2jNmo3aytzbx4RG6A9JRJRu6u6zoCCmck5Xa9CyGd1kG2utQ1Aau7M2gjdRhhKZGs1FvRLmqcsnvHVeTnQKSTW3phfbMFnG';
      const actual = getMasterKeyFromMnemonic('clerk blood add wish sorry vacant assault lounge wear enable search journey staff home town');
      assert.equal(actual, expected);
    });
    it('should return an empty string given a non-compliant to BIP39 mnemonic', () => {
      const expected = '';
      const actual = getMasterKeyFromMnemonic('kings play cards on friday generally speaking');
      assert.equal(actual, expected);
    });
  });
});
