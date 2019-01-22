const { expect } = require('chai');
const Dashcore = require('@dashevo/dashcore-lib');
const getUnusedAddress = require('../../src/Account/getUnusedAddress');


describe('Account - getUnusedAddress', () => {
  it('should get the proper unused address', () => {
    const unusedAddressExternal = getUnusedAddress.call(Object.assign({}, {
      store: mockedStore,
      getStore: mockedStore,
      walletId: '123456789',
    }));
    const unusedAddressInternal = getUnusedAddress.call(Object.assign({}, {
      store: mockedStore,
      getStore: mockedStore,
      walletId: '123456789',
    }), 'internal');
    expect(unusedAddressExternal).to.be.deep.equal({
      address: 'yhLGmtf5Jmdb3DUvsaNJUHyCjjxTcBJEry',
      balanceSat: 0,
      fetchedLast: 1534867406705,
      path: 'm/44\'/1\'/0\'/0/1',
      transactions: [],
      unconfirmedBalanceSat: 0,
      utxos: [],
      used: false,
    });
    expect(unusedAddressInternal).to.be.deep.equal({
      address: 'yXy7rfGH5tZJs9GmFbdk6hPg2mzb8MRdfC',
      balanceSat: 0,
      fetchedLast: 1534867407080,
      path: 'm/44\'/1\'/0\'/1/2',
      transactions: [],
      unconfirmedBalanceSat: 0,
      utxos: [],
      used: false,
    });
  });
});
const mockedStore = {
  wallets: {
    123456789: {
      addresses: {
        external: {
          "m/44'/1'/0'/0/0": {
            address: 'yizmJb63ygipuJaRgYtpWCV2erQodmaZt8',
            balanceSat: 100000000,
            fetchedLast: 0,
            path: "m/44'/1'/0'/0/0",
            transactions: [
              'dd7afaadedb5f022cec6e33f1c8520aac897df152bd9f876842f3723ab9614bc',
              '1d8f924bef2e24d945d7de2ac66e98c8625e4cefeee4e07db2ea334ce17f9c35',
              '7ae825f4ecccd1e04e6c123e0c55d236c79cd04c6ab64e839aed2ae0af3003e6',
            ],
            index: 0,
            unconfirmedBalanceSat: 0,
            used: true,
            utxos: [
              {
                address: 'yizmJb63ygipuJaRgYtpWCV2erQodmaZt8',
                txid: 'dd7afaadedb5f022cec6e33f1c8520aac897df152bd9f876842f3723ab9614bc',
                outputIndex: 0,
                scriptPubKey: '76a914f8c2652847720ab6d401291e5a48e2c8fe5d3c9f88ac',
                satoshis: 100000000,
              },
            ],
          },
          "m/44'/1'/0'/0/1": {
            address: 'yhLGmtf5Jmdb3DUvsaNJUHyCjjxTcBJEry',
            balanceSat: 0,
            fetchedLast: 1534867406705,
            path: "m/44'/1'/0'/0/1",
            transactions: [],
            unconfirmedBalanceSat: 0,
            utxos: [],
            used: false,
          },
          "m/44'/1'/0'/0/2": {
            address: 'yfX4zBhV6syJTbRJLwxhCNdXkDnE7Mj1N7',
            balanceSat: 0,
            fetchedLast: 1534867406711,
            path: "m/44'/1'/0'/0/2",
            transactions: [],
            unconfirmedBalanceSat: 0,
            utxos: [],
            used: false,
          },
        },
        internal: {
          "m/44'/1'/0'/1/0": {
            address: 'yjSivd8eWH1vVywaeePiHBLXqMbHFXxxXE',
            balanceSat: 1220560,
            fetchedLast: 1534867407092,
            path: "m/44'/1'/0'/1/0",
            transactions: [
              '688dd18dea2b6f3c2d3892d13b41922fde7be01cd6040be9f3568dafbf9b1a23',
            ],
            unconfirmedBalanceSat: 0,
            utxos: [
              '688dd18dea2b6f3c2d3892d13b41922fde7be01cd6040be9f3568dafbf9b1a23',
            ],
            used: true,
          },
          "m/44'/1'/0'/1/1": {
            address: 'yTM7nPiekjMBkMCU6cPmFD2KReeFUeVwCp',
            balanceSat: 99890000,
            fetchedLast: 1534867407080,
            path: "m/44'/1'/0'/1/1",
            transactions: [
              '1d8f924bef2e24d945d7de2ac66e98c8625e4cefeee4e07db2ea334ce17f9c35',
            ],
            unconfirmedBalanceSat: 0,
            utxos: [],
            used: true,
          },
          "m/44'/1'/0'/1/2": {
            address: 'yXy7rfGH5tZJs9GmFbdk6hPg2mzb8MRdfC',
            balanceSat: 0,
            fetchedLast: 1534867407080,
            path: "m/44'/1'/0'/1/2",
            transactions: [],
            unconfirmedBalanceSat: 0,
            utxos: [],
            used: false,
          },
        },
      },
    },
  },
};
