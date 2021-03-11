const {expect} = require('chai');
const setLastSyncedBlockHeight = require('./setLastSyncedBlockHeight');
const getSingleKeyMockWallet = require('../../../../test/mocks/getSingleKeyMockWallet');
const mockWallet = getSingleKeyMockWallet();

describe('TransactionSyncStreamWorker#getLastSyncedBlockHeight', function suite() {
  it('should correctly set last synced blockHeight', async () => {
    const blockHeight = setLastSyncedBlockHeight.call( mockWallet, 458972);
    expect(blockHeight).to.deep.equal(458972)
    expect(mockWallet.storage.store.wallets[mockWallet.walletId].accounts[mockWallet.index].blockHeight).to.deep.equal(458972)
  });
});
