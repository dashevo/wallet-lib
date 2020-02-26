const { expect } = require('chai');
const Dashcore = require('@dashevo/dashcore-lib');
const getTransactions = require('../../../../src/types/Account/methods/getTransactions');


describe('Account - getTransactions', () => {
  it('should get the transactions', () => {
    const getStore = () => mockedStore;
    const transactions = getTransactions.call(Object.assign({}, {
      storage: { getStore },
      walletId: '123456789',
    }), 'internal');
    expect(transactions).to.equal(mockedStore.transactions);
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
  transactions: {
    '9ab39713e9ce713d41ca6974db83e57bced02402e9516b8a662ed60d5c08f6d1': {
      blockhash: '000000000a84c4703da7a69cfa65837251e4aac80e1621f2a2cc9504e0c149ba',
      blockHeight: 201436,
      blocktime: 1533525448,
      fees: 1000,
      size: 225,
      txid: '9ab39713e9ce713d41ca6974db83e57bced02402e9516b8a662ed60d5c08f6d1',
      txlock: true,
      vin: [
        {
          txid: 'e4524e918977b70ab47160d8e3b87a5fa9f88f22e43f0eec2abbee2cf364c93b',
          vout: 1,
          sequence: 4294967295,
          n: 0,
          scriptSig: {
            hex: '4730440220154e37879e70784daff6cf04993cc88e8cf7e5357f82e98df9c117941cd5b3f702200d02f583085fbfd28c77d31c6b9a69f641a8fef5e99aaec8b8aedd4a3326e4100121025deea4fcd79eb876daa0f5829659c76f00f6b3fe6bf12e3ea83ecc763219bf88',
            asm: '30440220154e37879e70784daff6cf04993cc88e8cf7e5357f82e98df9c117941cd5b3f702200d02f583085fbfd28c77d31c6b9a69f641a8fef5e99aaec8b8aedd4a3326e410[ALL] 025deea4fcd79eb876daa0f5829659c76f00f6b3fe6bf12e3ea83ecc763219bf88',
          },
          addr: 'yhzoBe1aCTTganFBzFb3ErF4ufwMqonK5a',
          valueSat: 81246619083,
          value: 812.46619083,
          doubleSpentTxID: null,
        },
      ],
      vout: [
        {
          value: '2.00000000',
          n: 0,
          scriptPubKey: {
            hex: '76a914df128447b46f9c81edbf13494d12aabca066b65688ac',
            asm: 'OP_DUP OP_HASH160 df128447b46f9c81edbf13494d12aabca066b656 OP_EQUALVERIFY OP_CHECKSIG',
            addresses: [
              'ygewiYb7ZJxU4uuNGEVzbbA3wZEpEQJKhr',
            ],
            type: 'pubkeyhash',
          },
          spentTxId: '6b90bf01b10a0c6cac018d376823f6b330edf2cbb783cc3d02004f8706bbc311',
          spentIndex: 7,
          spentHeight: 203517,
        },
        {
          value: '810.46609083',
          n: 1,
          scriptPubKey: {
            hex: '76a914f67b2c4f47ea0a2bae829d3816a01cc486463d7988ac',
            asm: 'OP_DUP OP_HASH160 f67b2c4f47ea0a2bae829d3816a01cc486463d79 OP_EQUALVERIFY OP_CHECKSIG',
            addresses: [
              'yinidcHwrfzb4bEJDSq3wtQyxRAgQxsQia',
            ],
            type: 'pubkeyhash',
          },
          spentTxId: '22c368e09ad8b36553b383c6a4ae989f91d1f66622b2b685262580c8a45175a4',
          spentIndex: 0,
          spentHeight: 203155,
        },
      ],
    },
    '7ae825f4ecccd1e04e6c123e0c55d236c79cd04c6ab64e839aed2ae0af3003e6': {
      txid: '7ae825f4ecccd1e04e6c123e0c55d236c79cd04c6ab64e839aed2ae0af3003e6',
      blockhash: '000000000388f8a1de91702e25209aad802d28fcd2710ac2e2acd12e9738dbe2',
      blockHeight: 203633,
      blocktime: 1533827521,
      fees: 1000,
      size: 225,
      txlock: true,
      vout: [
        {
          value: '1.00000000',
          n: 0,
          scriptPubKey: {
            hex: '76a914f8c2652847720ab6d401291e5a48e2c8fe5d3c9f88ac',
            asm: 'OP_DUP OP_HASH160 f8c2652847720ab6d401291e5a48e2c8fe5d3c9f OP_EQUALVERIFY OP_CHECKSIG',
            addresses: [
              'yizmJb63ygipuJaRgYtpWCV2erQodmaZt8',
            ],
            type: 'pubkeyhash',
          },
          spentTxId: '1d8f924bef2e24d945d7de2ac66e98c8625e4cefeee4e07db2ea334ce17f9c35',
          spentIndex: 0,
          spentHeight: 204161,
        },
        {
          value: '18.99980000',
          n: 1,
          scriptPubKey: {
            hex: '76a9147d39e5ff6ea7b82c6dc69994f1075f157bee9ef688ac',
            asm: 'OP_DUP OP_HASH160 7d39e5ff6ea7b82c6dc69994f1075f157bee9ef6 OP_EQUALVERIFY OP_CHECKSIG',
            addresses: [
              'yXjag2zjTwA5Ya2sSV5KoFzTvE6uKdrnKa',
            ],
            type: 'pubkeyhash',
          },
          spentTxId: '6ca8795f2534972e1371249c3d7b6c5095e1513bc8cc351eeaa2f364020dbc01',
          spentIndex: 1,
          spentHeight: 203674,
        },
      ],
      vin: [
        {
          txid: '4ae8d1960c9a4ed83dbeaf1ad94b4a82f11c8574207144beda87113d94a31da1',
          vout: 1,
          sequence: 4294967295,
          n: 0,
          scriptSig: {
            hex: '47304402205483f0b26a04876fe8eceb9a5d86b1da93012be27b5482a3d53443cda5ee7a13022027410cef1e19c2620ad0da1b800252b620e3e8dc576efb069e95eb1d2222ccfb01210221d2f6bd1b101dc4eb40f570af2a87221e3ffa166b6c5eac2faf496b0c53cbdf',
            asm: '304402205483f0b26a04876fe8eceb9a5d86b1da93012be27b5482a3d53443cda5ee7a13022027410cef1e19c2620ad0da1b800252b620e3e8dc576efb069e95eb1d2222ccfb[ALL] 0221d2f6bd1b101dc4eb40f570af2a87221e3ffa166b6c5eac2faf496b0c53cbdf',
          },
          addr: 'yUvr9AxuFx3ifp8HHFdYnVGbvK8Qqz25SQ',
          valueSat: 1999990000,
          value: 19.9999,
          doubleSpentTxID: null,
        },
      ],
    },
    '1d8f924bef2e24d945d7de2ac66e98c8625e4cefeee4e07db2ea334ce17f9c35': {
      txid: '1d8f924bef2e24d945d7de2ac66e98c8625e4cefeee4e07db2ea334ce17f9c35',
      blockhash: '0000000002922d7d0a69ce3e29908dc26aba6565af760d208dac77a8b520fbf3',
      blockHeight: 204161,
      blocktime: 1533900199,
      fees: 1000,
      size: 226,
      txlock: false,
      vout: [
        {
          value: '0.00100000',
          n: 0,
          scriptPubKey: {
            hex: '76a914f3145d42d98196ca439eee48da05af56c2d7c4a688ac',
            asm: 'OP_DUP OP_HASH160 f3145d42d98196ca439eee48da05af56c2d7c4a6 OP_EQUALVERIFY OP_CHECKSIG',
            addresses: [
              'yiUjSkhkAfaHfYYmTMhc27NCmogJ3iRBaS',
            ],
            type: 'pubkeyhash',
          },
          spentTxId: null,
          spentIndex: null,
          spentHeight: null,
        },
        {
          value: '0.99890000',
          n: 1,
          scriptPubKey: {
            hex: '76a9144d19cc13106cac13b386c89b003b02992ae8c5e688ac',
            asm: 'OP_DUP OP_HASH160 4d19cc13106cac13b386c89b003b02992ae8c5e6 OP_EQUALVERIFY OP_CHECKSIG',
            addresses: [
              'yTM7nPiekjMBkMCU6cPmFD2KReeFUeVwCp',
            ],
            type: 'pubkeyhash',
          },
          spentTxId: null,
          spentIndex: null,
          spentHeight: null,
        },
      ],
      vin: [
        {
          txid: '7ae825f4ecccd1e04e6c123e0c55d236c79cd04c6ab64e839aed2ae0af3003e6',
          vout: 0,
          sequence: 4294967295,
          n: 0,
          scriptSig: {
            hex: '483045022100ad3c7a5eae5ccb491c0e2cc3521df2cc410bf403340d6587848dc5ceb2b6831f022016b622ee329a4ceb1364d3e7295832af30e4fbc63420257b5b4971185048ac410121022efe5f45f47813efa1a279296c0171823736ae90c617ef2bda52becc56611536',
            asm: '3045022100ad3c7a5eae5ccb491c0e2cc3521df2cc410bf403340d6587848dc5ceb2b6831f022016b622ee329a4ceb1364d3e7295832af30e4fbc63420257b5b4971185048ac41[ALL] 022efe5f45f47813efa1a279296c0171823736ae90c617ef2bda52becc56611536',
          },
          addr: 'yizmJb63ygipuJaRgYtpWCV2erQodmaZt8',
          valueSat: 100000000,
          value: 1,
          doubleSpentTxID: null,
        },
      ],
    },
  },
};
