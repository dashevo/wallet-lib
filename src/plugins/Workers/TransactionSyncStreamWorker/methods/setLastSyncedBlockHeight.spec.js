const {expect} = require('chai');
const setLastSyncedBlockHeight = require('./setLastSyncedBlockHeight');
const getSingleKeyMockStore = require('../../../../test/mocks/getSingleKeyMockStore');
const mockStore = getSingleKeyMockStore();

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
