const { expect } = require('chai');
const importTransaction = require('../../src/Storage/importTransaction');

describe('Storage - importTransaction', () => {
  it('should throw on failed import', () => {
    const mockOpts1 = { };
    const mockOpts2 = '688dd18dea2b6f3c2d3892d13b41922fde7be01cd6040be9f3568dafbf9b1a23';
    const mockOpts3 = { '688dd18dea2b6f3c2d3892d13b41922fde7be01cd6040be9f3568dafbf9b1a23': {} };
    const mockOpts4 = { txid: '688dd18dea2b6f3c2d3892d13b41922fde7be01cd6040be9f3568dafbf9b1a23' };
    const mockOpts5 = { txid: '688dd18dea2b6f3c2d3892d13b41922fde7be01cd6040be9f3568dafbf9b1a23', vin: [] };

    const exceptedException1 = 'Transaction txid: unknown should have property txid of type txid';
    const exceptedException2 = 'Transaction txid: unknown should have property txid of type txid';
    const exceptedException3 = 'Transaction txid: unknown should have property txid of type txid';
    const exceptedException4 = 'Transaction txid: 688dd18dea2b6f3c2d3892d13b41922fde7be01cd6040be9f3568dafbf9b1a23 should have property vin of type array';
    const exceptedException5 = 'Transaction txid: 688dd18dea2b6f3c2d3892d13b41922fde7be01cd6040be9f3568dafbf9b1a23 should have property vout of type array';

    expect(() => importTransaction.call({}, mockOpts1)).to.throw(exceptedException1);
    expect(() => importTransaction.call({}, mockOpts2)).to.throw(exceptedException2);
    expect(() => importTransaction.call({}, mockOpts3)).to.throw(exceptedException3);
    expect(() => importTransaction.call({}, mockOpts4)).to.throw(exceptedException4);
    expect(() => importTransaction.call({}, mockOpts5)).to.throw(exceptedException5);
  });
  it('should import a transaction', () => {
    const mockOpts = { txid: '688dd18dea2b6f3c2d3892d13b41922fde7be01cd6040be9f3568dafbf9b1a23', vin: [], vout: [] };

    const self = {
      store: {
        transactions: {},
      },
    };
    importTransaction.call(self, mockOpts);

    const expectedSelf = {
      store: {
        transactions: { '688dd18dea2b6f3c2d3892d13b41922fde7be01cd6040be9f3568dafbf9b1a23': { txid: '688dd18dea2b6f3c2d3892d13b41922fde7be01cd6040be9f3568dafbf9b1a23', vin: [], vout: [] } },
      },
      lastModified: +new Date(),
    };

    expect(self).to.be.deep.equal(expectedSelf);
  });
});
