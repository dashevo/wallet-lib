const { expect } = require('chai');
const getTransactionHistory = require('../../src/Account/getTransactionHistory');
const searchTransaction = require('../../src/Storage/searchTransaction');
const getTransaction = require('../../src/Storage/getTransaction');
const searchAddress = require('../../src/Storage/searchAddress');
const mockedStore = require('../fixtures/duringdevelop-fullstore-snapshot-1548410546');


describe('Account - getTransactionHistory', () => {
  it('should return an empty array on no transaction history', async () => {
    const storage = {
      store: mockedStore,
      getStore: () => mockedStore,
      mappedAddress: {},
    };

    const walletId = Object.keys(mockedStore.wallets)[0];
    const self = Object.assign({
      walletId,
      storage,
    });

    self.storage.searchTransaction = searchTransaction.bind(storage);
    self.storage.searchAddress = searchAddress.bind(storage);
    self.getTransaction = getTransaction.bind(storage);

    const txHistory = await getTransactionHistory.call(self);

    const expectedTxHistory = [
      {
        fees: 930,
        from: [
          'yQSVFizTKcPLz2V7zoZ3HkkJ7sQmb5jXAs',
          'yNY6spErvvm9C8at2KQpvAfd6TPumgyETh',
          'yhnTNo6tkmr8tA4SAL8gcci1z5rPHuaoxA',
          'ySVpgHLkgrrrsbaWJhW5GMHZjeSkADrsTJ',
          'yeLbU1At3Cp4RD7Gunic6iy6orgnoNDhEb',
        ],
        time: 1548410546,
        to: [{
          address: 'ycyFFyWCPSWbXLZBeYppJqgvBF7bnu8BWQ',
          amount: '989.99995785',
        }],
        txid: 'bb0c341e970418422bb94eb20d3ddb00a350907e2ef9d6247324665f78467872',
        type: 'sent',
      },
      {
        fees: 247,
        from: [
          'yU7hmdDdi9RWem64hMz3GV3i9UWHNNK2FS',
        ],
        time: 1548409108,
        to: [{
          address: 'yNY6spErvvm9C8at2KQpvAfd6TPumgyETh',
          amount: '139.99997456',
        }],
        txid: '5fc934fc42534dca5bea8d4f5cc5afa721dc1ce092e854050b761e3d4b757cc7',
        type: 'moved',
      },
      {
        fees: 247,
        from: [
          'yfyTKf2PaxFvND6V5pEFWpnrbcSdy3igZQ',
        ],
        time: 1548409108,
        to: [{
          address: 'yNY6spErvvm9C8at2KQpvAfd6TPumgyETh',
          amount: '300.99999753',
        }],
        txid: 'f093df5d83371c2f2f167399b2b27bc79d3387c7fd41575ba44881bace228bbe',
        type: 'moved',
      },
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
    expect(txHistory).to.be.deep.equal(expectedTxHistory);
  });
});
