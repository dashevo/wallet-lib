const {expect} = require('chai');
const getLastSyncedBlockHeight = require('./getLastSyncedBlockHeight');

const getSingleKeyMockWallet = require('../../../../test/mocks/getSingleKeyMockWallet');
const mockWallet = getSingleKeyMockWallet();

describe('TransactionSyncStreamWorker#getLastSyncedBlockHeight', function suite() {
  it('should correctly get last synced blockHeight', async () => {
    const blockHeight = getLastSyncedBlockHeight.call( mockWallet);
    expect(blockHeight).to.deep.equal(458971)
  });
});
