const {expect} = require('chai');
const getLastSyncedBlockHeight = require('./getLastSyncedBlockHeight');

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
  it('should correctly get last synced blockHeight', async () => {
    const blockHeight = getLastSyncedBlockHeight.call( mock);
    expect(blockHeight).to.deep.equal(458971)
  });
});
