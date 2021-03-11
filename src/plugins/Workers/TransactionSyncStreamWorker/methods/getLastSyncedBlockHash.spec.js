const {expect} = require('chai');
const getLastSyncedBlockHash = require('./getLastSyncedBlockHash');

const getSingleKeyMockWallet = require('../../../../test/mocks/getSingleKeyMockWallet');
const mockWallet = getSingleKeyMockWallet();

describe('TransactionSyncStreamWorker#getLastSyncedBlockHash', function suite() {
  it('should correctly get last synced blockHash', async () => {
    const blockHash = getLastSyncedBlockHash.call( mockWallet);
    expect(blockHash).to.deep.equal("00000072edc9e031ff7aa3eb529511538c8a4899d5befea28848578e06c73313")
  });
});
