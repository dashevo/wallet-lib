const { expect } = require('chai');
const SecureStorage = require('../../src/adapters/secureStorage');

const secureStorage = new SecureStorage();

describe('SecureStorage', () => {
  const item = { testKey: 'testValue' };

  it('sets and gets without secret', () => {
    secureStorage.setItem('test', item);
    expect(secureStorage.getItem('test')).to.deep.equal(item);
  });

  it('sets and gets with secret', () => {
    secureStorage.setItem('test', item, 'secret');
    expect(secureStorage.getItem('test', 'secret')).to.deep.equal(item);
  });

  it('returns null when secret is incorrect', () => {
    secureStorage.setItem('test', item, 'secret1');
    expect(secureStorage.getItem('test', 'secret2')).to.be.null;
  });
});
