const { expect } = require('chai');
let startHistoricalSync = require('./startHistoricalSync');
const setLastSyncedBlockHash = require('./setLastSyncedBlockHash');
const setLastSyncedBlockHeight = require('./setLastSyncedBlockHeight');
const getSingleKeyMockStore = require('../../../../test/mocks/getSingleKeyMockStore');
const mockStore = getSingleKeyMockStore();

const sinon = require('sinon')
const sandbox = sinon.createSandbox();
const TransportMock = require('../../../../test/mocks/TransportMock')
const TxStreamMock = require('../../../../test/mocks/TxStreamMock')


const mockWallet = {
  walletId: "f03f3fa4b5",
  storage: {
    store: mockStore,
  },
  index:0,
  walletType: 'single_address'
}
describe('TransactionSyncStreamWorker#startHistoricalSync', function suite() {
  let transportMock;
  let txStreamMock;
  let getLastSyncedBlockHeight;
  let getLastSyncedBlockHash;
  let getBestBlockHeightFromTransport;
  let syncUpToTheGapLimit;

  beforeEach(async ()=>{
    txStreamMock = new TxStreamMock();
    transportMock = new TransportMock(sandbox, txStreamMock);
    getLastSyncedBlockHeight = sandbox.stub();
    getLastSyncedBlockHash = sandbox.stub();
    syncUpToTheGapLimit = sandbox.stub();
    getBestBlockHeightFromTransport = transportMock.getBestBlockHeight;

    mockWallet.getLastSyncedBlockHeight = getLastSyncedBlockHeight;
    mockWallet.setLastSyncedBlockHeight = setLastSyncedBlockHeight;
    mockWallet.getLastSyncedBlockHash = getLastSyncedBlockHash;
    mockWallet.setLastSyncedBlockHash = setLastSyncedBlockHash;
    mockWallet.getBestBlockHeightFromTransport = getBestBlockHeightFromTransport;
    mockWallet.transport = transportMock;
    mockWallet.syncUpToTheGapLimit = syncUpToTheGapLimit;
    startHistoricalSync = sandbox.spy(startHistoricalSync)
  })

  it('should correctly start from set height', async () => {
    const lastSyncedBlockHeight = 458971;
    const bestBlockHeight = 458991;

    transportMock.getBestBlockHeight.returns(bestBlockHeight);
    transportMock.getBlockHeaderByHeight.returns({hash: 'cde'});
    syncUpToTheGapLimit.returns(false);

    getLastSyncedBlockHeight.returns(lastSyncedBlockHeight);
    getLastSyncedBlockHash.returns(null);

    const startSync = await startHistoricalSync.call( mockWallet, 'testnet');
    expect(mockStore.wallets['f03f3fa4b5'].accounts["0"].blockHeight).to.deep.equal(458991)
    expect(mockStore.wallets['f03f3fa4b5'].accounts["0"].blockHash).to.deep.equal('cde')
    expect(startHistoricalSync.firstCall.args[0]).to.be.equal('testnet');
    expect(syncUpToTheGapLimit.firstCall.args[0]).to.be.deep.equal({
      count:458991,
      fromBlockHeight:458971,
      network:"testnet"
    });
  });
  it('should correctly start from set hash using bestBlockHeight as count', async () => {
    const bestBlockHeight = 458991;

    transportMock.getBestBlockHeight.returns(bestBlockHeight);
    transportMock.getBlockHeaderByHeight.returns({hash: 'cde'});
    syncUpToTheGapLimit.returns(false);

    getLastSyncedBlockHeight.returns(42);
    getLastSyncedBlockHash.returns('abc');

    const startSync = await startHistoricalSync.call( mockWallet, 'testnet');
    expect(mockStore.wallets['f03f3fa4b5'].accounts["0"].blockHeight).to.deep.equal(458991)
    expect(mockStore.wallets['f03f3fa4b5'].accounts["0"].blockHash).to.deep.equal('cde')
    expect(startHistoricalSync.firstCall.args[0]).to.be.equal('testnet');
    expect(syncUpToTheGapLimit.firstCall.args[0]).to.be.deep.equal({
      count:458991,
      fromBlockHash:"abc",
      network:"testnet"
    });

  });
});
