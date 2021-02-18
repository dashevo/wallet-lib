const { expect } = require('chai');
const InMemoryAdapter = require('./InMemoryAdapter');

const inMemoryAdapter = new InMemoryAdapter();

describe('Adapter - InMemoryAdapter', function suite() {
  this.timeout(10000);
  it('should provide a config method', () => {
    expect(inMemoryAdapter.config).to.exist;
  });
  it('should set an item', () => {
    const item = { item: 'item' };
    inMemoryAdapter.setItem('foo', item);
    expect(inMemoryAdapter.setItem('foo', item)).to.deep.equal(item);
  });
  it('should get an item', () => {
    const item = { item: 'item' };
    expect(inMemoryAdapter.getItem('foo')).to.deep.equal(item);
  });
});
