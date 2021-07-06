const GetIdentityIdsByPublicKeyHashesResponse = require('@dashevo/dapi-client/lib/methods/platform/getIdentityIdsByPublicKeyHashes/GetIdentityIdsByPublicKeyHashesResponse');
const getStatus = require('../../transport/FixtureTransport/methods/getStatus');

const metadata = {
  height: 10,
  coreChainLockedHeight: 42,
};

class TransportMock {
  constructor(sinonSandbox, transactionStreamMock) {
    this.sinonSandbox = sinonSandbox;

    this.getBestBlockHeight = sinonSandbox.stub().returns(42);
    this.subscribeToTransactionsWithProofs = sinonSandbox.stub().returns(transactionStreamMock);
    this.getBlockHeaderByHeight = sinonSandbox.stub().returns({ hash: 123 });
    this.on = sinonSandbox.stub();
    this.subscribeToBlocks = sinonSandbox.stub();
    this.getIdentityIdsByPublicKeyHash = sinonSandbox.stub().returns([null]);
    this.sendTransaction = sinonSandbox.stub();
    this.getStatus = sinonSandbox.stub().resolves(getStatus());
  }
}

module.exports = TransportMock;
