const { expect } = require('chai');
const EventEmitter = require('events');

const {
  PrivateKey,
  Transaction,
  MerkleBlock,
} = require('@dashevo/dashcore-lib')

const TransactionSyncStreamWorker = require('./TransactionSyncStreamWorker');
const Storage = require('../../../types/Storage/Storage');

const BIP44PATH = `m/44'/1'/0'`

class StreamDataResponse {
  /**
   *
   * @param options
   * @param {Buffer} [options.rawMerkleBlock]
   * @param {Buffer[]} [options.rawTransactions]
   */
  constructor({rawMerkleBlock, rawTransactions}) {
    this.rawMerkleBlock = rawMerkleBlock;
    this.rawTransactions = rawTransactions;
  }

  /**
   * @return {Buffer}
   */
  getRawMerkleBlock() {
    return this.rawMerkleBlock;
  }

  /**
   * @return {{getTransactionsList: (): Buffer[]}}
   */
  getRawTransactions() {
    const { rawTransactions } = this;
    return {
      getTransactionsList() {
        return rawTransactions;
      }
    };
  }
}

class StreamMock extends EventEmitter {
  constructor() {
    super();
  }

  cancel() {
    // TODO: emit "stream cancelled error"
    this.emit(StreamMock.EVENTS.error, new Error());
  }
}

StreamMock.EVENTS = {
  cancel: 'cancel',
  data: 'data',
  end: 'end',
  error: 'error'
}

describe('TransactionSyncStreamWorker', function suite() {
  this.timeout(60000);
  let worker;
  let mockParentEmitter;
  let storage;
  let walletId;
  let dependenciesMock;
  let streamMock;
  let address;
  let network;

  beforeEach(function beforeEach() {
    network = 'testnet';
    address = new PrivateKey().toAddress(network);

    streamMock = new StreamMock();

    storage = new Storage();
    mockParentEmitter = Object.create(EventEmitter.prototype);
    storage.createWallet();
    walletId = Object.keys(storage.store.wallets)[0];

    dependenciesMock = {
      transport: {
        getBestBlockHeight: this.sinonSandbox.stub().returns(42),
        subscribeToTransactionsWithProofs: () => {
          return streamMock;
        }
      },
      storage,
      walletId,
      getAddress: this.sinonSandbox.stub().returns(),
      network,
      BIP44PATH,
      getLastSyncedBlockHeight: this.sinonSandbox.stub().returns(1),
    };

    storage.store.wallets[walletId].accounts[BIP44PATH] = {

    };

    storage.store.wallets[walletId].addresses = {
      'someWalletType': {
        'someWalletPath': {
          address,
        },
      },
    };

    worker = new TransactionSyncStreamWorker();

    Object.assign(worker, dependenciesMock);
    worker.parentEvents = mockParentEmitter;
  });

  afterEach(() => {
    worker.stopWorker();
  })

  describe("Historical data", () => {
    it('should sync historical data from the last saved block', async function () {
      const lastSavedBlockHeight = 40;
      const bestBlockHeight = 42;

      dependenciesMock.getLastSyncedBlockHeight
        .returns(lastSavedBlockHeight);
      dependenciesMock.transport.getBestBlockHeight
        .returns(bestBlockHeight);

      setTimeout(() => {
        try {
          expect(worker.stream).is.not.null;

          const transaction = new Transaction()
            .to(address, 1);
          //const merkleBlock = new MerkleBlock();

          for (let i = lastSavedBlockHeight; i <= bestBlockHeight; i++) {
            streamMock.emit(StreamMock.EVENTS.data, new StreamDataResponse({
              rawTransactions: [transaction.toBuffer()]
            }));
          }

          streamMock.emit(StreamMock.EVENTS.end);
        } catch (e) {
          console.error(e);
          streamMock.emit(StreamMock.EVENTS.error, e);
        }
      }, 10)

      await worker.onStart();

      expect(worker.stream).to.be.null;
      expect(storage.getStore().transactions).to.be.deep.equal([]);
    });
    it("should sync historical data from the genesis if there's no previous sync data", async function () {
      expect.fail("Not implemented");
    });
    it('should reconnect to the historical stream when gap limit is filled', async function () {
      expect.fail('Not implemented');
    });
    it('should reconnect to the historical stream if stream is closed due to operational GRPC error', async function () {
      expect.fail('Not implemented');
    });
    it('should not reconnect to the historical stream if stream in case of any other error', async function () {
      expect.fail('Not implemented');
    });
    it('should reconnect to the historical stream if stream is closed by the server', async function () {
      expect.fail('Not implemented');
    });
  });

  describe("Incoming data", () => {
    it('should sync incoming transactions and save it to the storage', async function () {
      await worker.execute();
    })
    it('should receive own sent transactions and save it to the storage', async function () {
      expect.fail('Not implemented');
    });
    it('should reconnect to the incoming stream when gap limit is filled', async function () {
      expect.fail('Not implemented');
    });
    it('should reconnect to the incoming stream if stream is closed due to operational GRPC error', async function () {
      expect.fail('Not implemented');
    });
    it('should not reconnect to the incoming stream if stream in case of any other error', async function () {
      expect.fail('Not implemented');
    });
  });
});
