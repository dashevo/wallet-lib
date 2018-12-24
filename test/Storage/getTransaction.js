const { expect } = require('chai');
const getTransaction = require('../../src/Storage/getTransaction');

describe('Storage - getTransaction', () => {
  it('should throw on failed fetching', () => {
    const exceptedException1 = 'Transaction is not in store : 688dd18dea2b6f3c2d3892d13b41922fde7be01cd6040be9f3568dafbf9b1a23';
    const self = {
      store: {
        transactions: {},
      },
    };
    expect(() => getTransaction.call(self, '688dd18dea2b6f3c2d3892d13b41922fde7be01cd6040be9f3568dafbf9b1a23')).to.throw(exceptedException1);
  });
  it('should work', () => {
    const self = {
      store: {
        transactions: {
          '688dd18dea2b6f3c2d3892d13b41922fde7be01cd6040be9f3568dafbf9b1a23': {
            something: true,
          },
        },
      },
    };
    const txid = '688dd18dea2b6f3c2d3892d13b41922fde7be01cd6040be9f3568dafbf9b1a23';
    expect(getTransaction.call(self, txid)).to.deep.equal({ something: true });
  });
});
