const {expect} = require('chai');
const setLastSyncedBlockHeight = require('./setLastSyncedBlockHeight');

const mockStore = {
  "transactions": {},
  "wallets": {
    "f03f3fa4b5": {
      "accounts": {
        "0": {
          "label": null,
          "network": "testnet",
          "blockHeight": 458971,
          "blockHash": "00000072edc9e031ff7aa3eb529511538c8a4899d5befea28848578e06c73313"
        }
      },
    }
  }
}
const mock = {
  walletId: "f03f3fa4b5",
  storage: {
    store: mockStore,
  },
  index:0,
  walletType: 'single_address'
}
describe('TransactionSyncStreamWorker#getLastSyncedBlockHeight', function suite() {
  it('should correctly set last synced blockHeight', async () => {
    const blockHeight = setLastSyncedBlockHeight.call( mock, 458972);
    expect(blockHeight).to.deep.equal(458972)
    expect(mockStore.wallets['f03f3fa4b5'].accounts["0"].blockHeight).to.deep.equal(458972)
  });
});
