const { expect } = require('chai');
const SecureStorage = require('../../src/adapters/secureStorage');

describe('SecureStorage', () => {
  const item = { testKey: 'testValue' };

  it('sets and gets without secret', () => {
    const secureStorage = new SecureStorage();
    secureStorage.setItem('test', item);
    expect(secureStorage.getItem('test')).to.deep.equal(item);
  });

  it('sets and gets with secret', () => {
    const secureStorage = new SecureStorage('secret');
    secureStorage.setItem('test', item);
    expect(secureStorage.getItem('test')).to.deep.equal(item);
  });
});
