const {expect} = require('chai');
const setLastSyncedBlockHash = require('./setLastSyncedBlockHash');

const getSingleKeyMockWallet = require('../../../../test/mocks/getSingleKeyMockWallet');
const mockWallet = getSingleKeyMockWallet();

describe('TransactionSyncStreamWorker#getLastSyncedBlockHeight', function suite() {
  it('should correctly set last synced blockHeight', async () => {
    const blockHash = setLastSyncedBlockHash.call( mockWallet, "000000b4004dca015be55a1aba0c584e1ba77fbc8d17740362a9749d7168317e");
    expect(blockHash).to.deep.equal("000000b4004dca015be55a1aba0c584e1ba77fbc8d17740362a9749d7168317e")
    expect(mockWallet.storage.store.wallets[mockWallet.walletId].accounts[mockWallet.index].blockHash).to.deep.equal("000000b4004dca015be55a1aba0c584e1ba77fbc8d17740362a9749d7168317e")
  });
});
