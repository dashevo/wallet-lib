const { expect } = require('chai');
const Dashcore = require('@dashevo/dashcore-lib');
const getTransactionHistory = require('../../src/Account/getTransactionHistory');
const searchTransaction = require('../../src/Storage/searchTransaction');
const getTransaction = require('../../src/Storage/getTransaction');
const searchAddress = require('../../src/Storage/searchAddress');
const mockedStore = require('../fixtures/mockedStore1');
const mockedStore2 = require('../fixtures/getTransactionHistory');


describe('Account - getTransactionHistory', () => {
  it('should return an empty array on no transaction history', async () => {
    const storage = {
      store: mockedStore2,
      getStore: () => mockedStore2,
      mappedAddress: {},
    };

    const self = Object.assign({
      walletId: mockedStore2.walletId,
      storage,
    });

    self.storage.searchTransaction = searchTransaction.bind(storage);
    self.storage.searchAddress = searchAddress.bind(storage);
    self.getTransaction = getTransaction.bind(storage);

    const txHistory = await getTransactionHistory.call(self);

    const expectedTxHistory = [
      {
        fees: 247,
        from: [
          'yRf8x9bov39e2vHtibjeG35ZNF4BCpSZGe',
        ],
        time: 1548153589,
        to: [{
          address: 'yhnTNo6tkmr8tA4SAL8gcci1z5rPHuaoxA',
          amount: '125.00000000',
        }],
        txid: '9a606bc71c4c87aa7735d55dc7f01047289b77945b9617615e9afc4643e14fdf',
        type: 'moved',
      },
      {
        fees: 247,
        from: [
          'ybTg1Xema7wsGHGxSMQUSNoxyYRkTMUWJd',
        ],
        time: 1548153208,
        to: [{
          address: 'yQSVFizTKcPLz2V7zoZ3HkkJ7sQmb5jXAs',
          amount: '350.00000000',
        }],
        txid: '00131c6c3ab8fca20380c6766f414a78f05b2e1783ce2632c9469d7357305dcb',
        type: 'moved',
      },
      {
        fees: 247,
        from: [
          'ybTg1Xema7wsGHGxSMQUSNoxyYRkTMUWJd',
        ],
        time: 1548152219,
        to: [{
          address: 'yRf8x9bov39e2vHtibjeG35ZNF4BCpSZGe',
          amount: '450.00000000',
        }],
        txid: 'f4b0c5df91ce3bbbcf471cfbd4b024083ad66048126bd5d6732459a07e266059',
        type: 'moved',
      },
      {
        fees: 2050,
        from: [
          'yNfUebksUc5HoSfg8gv98ruC3jUNJUM8pT',
        ],
        time: 1548144723,
        to: [{
          address: 'yWNrA4srrAjC9DT6UCu8NgpcqwQWa35dFX',
          amount: '10.00000000',
        }],
        txid: 'cdcf81b69629c3157f09878076bc4f544aa01477cf59915461343476772a4a84',
        type: 'sent',
      },
      {
        fees: 374,
        from: [
          'yhvXpqQjfN9S4j5mBKbxeGxiETJrrLETg5',
        ],
        time: 1548141724,
        to: [{
          address: 'yNfUebksUc5HoSfg8gv98ruC3jUNJUM8pT',
          amount: '1000',
        }],
        type: 'receive',
        txid: '507e56181d03ba75b133f93cd073703c5c514f623f30e4cc32144c62b5a697c4',
      },
    ];
    console.log(txHistory);
    expect(txHistory).to.be.deep.equal(expectedTxHistory);
  });
  it('should get the proper tx history', async () => {
    // const storage = {
    //   store: mockedStore,
    //   getStore: () => mockedStore,
    //   mappedAddress: {},
    // };
    // const self = Object.assign({}, {
    //   storage,
    //   walletId: '123456789',
    // });
    // self.storage.searchTransaction = searchTransaction.bind(storage);
    // self.storage.searchAddress = searchAddress.bind(storage);
    // self.getTransaction = getTransaction.bind(storage);
    //
    // const txHistory = await getTransactionHistory.call(self);
    //
    // const expectedTxHistory = [{
    //   type: 'receive', txid: 'dd7afaadedb5f022cec6e33f1c8520aac897df152bd9f876842f3723ab9614bc', time: 0, from: ['yYC5x9QkcKcRyYVdzaAVAArSCD39byLRcm'], to: { address: 'yizmJb63ygipuJaRgYtpWCV2erQodmaZt8', amount: '1.00000000' },
    // }, {
    //   type: 'receive', txid: '1d8f924bef2e24d945d7de2ac66e98c8625e4cefeee4e07db2ea334ce17f9c35', time: 1533900199, from: ['yizmJb63ygipuJaRgYtpWCV2erQodmaZt8'], to: { address: 'yTM7nPiekjMBkMCU6cPmFD2KReeFUeVwCp', amount: '0.99890000' },
    // }, {
    //   type: 'receive', txid: '7ae825f4ecccd1e04e6c123e0c55d236c79cd04c6ab64e839aed2ae0af3003e6', time: 1533827521, from: ['yUvr9AxuFx3ifp8HHFdYnVGbvK8Qqz25SQ'], to: { address: 'yizmJb63ygipuJaRgYtpWCV2erQodmaZt8', amount: '1.00000000' },
    // }, {
    //   type: 'receive', txid: '688dd18dea2b6f3c2d3892d13b41922fde7be01cd6040be9f3568dafbf9b1a23', time: 1534255937, from: ['yizmJb63ygipuJaRgYtpWCV2erQodmaZt8'], to: { address: 'yjSivd8eWH1vVywaeePiHBLXqMbHFXxxXE', amount: '0.01220560' },
    // }];
    // expect(txHistory).to.be.deep.equal(expectedTxHistory);
  });
});
