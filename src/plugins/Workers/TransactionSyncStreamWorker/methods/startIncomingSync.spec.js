const { expect } = require('chai');
let startIncomingSync = require('./startIncomingSync');
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
  network: 'testnet',
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
    startIncomingSync = sandbox.spy(startIncomingSync)
  })

  it('should correctly start from set height', async () => {
    const lastSyncedBlockHeight = 458971;

    getLastSyncedBlockHeight.returns(lastSyncedBlockHeight);
    getLastSyncedBlockHash.returns(null);

    await startIncomingSync.call( mockWallet);
    expect(mockStore.wallets['f03f3fa4b5'].accounts["0"].blockHeight).to.deep.equal(458971)
    expect(mockStore.wallets['f03f3fa4b5'].accounts["0"].blockHash).to.deep.equal('00000072edc9e031ff7aa3eb529511538c8a4899d5befea28848578e06c73313')
    expect(startIncomingSync.callCount).to.be.equal(1);
    expect(syncUpToTheGapLimit.firstCall.args[0]).to.be.deep.equal({
      count:0,
      fromBlockHeight:458971,
      network: 'testnet'
    });
  });
  it('should correctly start from set hash', async () => {
    transportMock.getBlockHeaderByHeight.returns({hash: 'cde'});
    syncUpToTheGapLimit.returns(false);

    getLastSyncedBlockHeight.returns(42);
    getLastSyncedBlockHash.returns('abc');

    await startIncomingSync.call( mockWallet);
    expect(mockStore.wallets['f03f3fa4b5'].accounts["0"].blockHeight).to.deep.equal(458971)
    expect(mockStore.wallets['f03f3fa4b5'].accounts["0"].blockHash).to.deep.equal('00000072edc9e031ff7aa3eb529511538c8a4899d5befea28848578e06c73313')
    expect(startIncomingSync.callCount).to.be.equal(1);
    expect(syncUpToTheGapLimit.firstCall.args[0]).to.be.deep.equal({
      count:0,
      fromBlockHash:"abc",
      network:"testnet"
    });
  });
});
