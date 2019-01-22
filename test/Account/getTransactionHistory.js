const { expect } = require('chai');
const Dashcore = require('@dashevo/dashcore-lib');
const getTransactionHistory = require('../../src/Account/getTransactionHistory');
const searchTransaction = require('../../src/Storage/searchTransaction');
const getTransaction = require('../../src/Storage/getTransaction');
const searchAddress = require('../../src/Storage/searchAddress');
const mockedStore = require('../fixtures/mockedStore1');


describe('Account - getTransactionHistory', () => {
  it('should get the proper tx history', async () => {
    const storage = {
      store: mockedStore,
      getStore: () => mockedStore,
      mappedAddress: {},
    };
    const self = Object.assign({}, {
      storage,
      walletId: '123456789',
    });
    self.storage.searchTransaction = searchTransaction.bind(storage);
    self.storage.searchAddress = searchAddress.bind(storage);
    self.getTransaction = getTransaction.bind(storage);

    const txHistory = await getTransactionHistory.call(self);

    const expectedTxHistory = [{
      type: 'receive', txid: 'dd7afaadedb5f022cec6e33f1c8520aac897df152bd9f876842f3723ab9614bc', time: 0, from: ['yYC5x9QkcKcRyYVdzaAVAArSCD39byLRcm'], to: { address: 'yizmJb63ygipuJaRgYtpWCV2erQodmaZt8', amount: '1.00000000' },
    }, {
      type: 'receive', txid: '1d8f924bef2e24d945d7de2ac66e98c8625e4cefeee4e07db2ea334ce17f9c35', time: 1533900199, from: ['yizmJb63ygipuJaRgYtpWCV2erQodmaZt8'], to: { address: 'yTM7nPiekjMBkMCU6cPmFD2KReeFUeVwCp', amount: '0.99890000' },
    }, {
      type: 'receive', txid: '7ae825f4ecccd1e04e6c123e0c55d236c79cd04c6ab64e839aed2ae0af3003e6', time: 1533827521, from: ['yUvr9AxuFx3ifp8HHFdYnVGbvK8Qqz25SQ'], to: { address: 'yizmJb63ygipuJaRgYtpWCV2erQodmaZt8', amount: '1.00000000' },
    }, {
      type: 'receive', txid: '688dd18dea2b6f3c2d3892d13b41922fde7be01cd6040be9f3568dafbf9b1a23', time: 1534255937, from: ['yizmJb63ygipuJaRgYtpWCV2erQodmaZt8'], to: { address: 'yjSivd8eWH1vVywaeePiHBLXqMbHFXxxXE', amount: '0.01220560' },
    }];
    expect(txHistory).to.be.deep.equal(expectedTxHistory);
  });
});
