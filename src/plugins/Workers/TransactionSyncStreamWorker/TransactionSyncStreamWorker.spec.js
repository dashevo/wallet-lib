const { expect } = require('chai');
const EventEmitter = require('events');
const { WALLET_TYPES } = require('../../../CONSTANTS');
const importTransactions = require('../../../types/Account/methods/importTransactions');
const getAddress = require('../../../types/Account/methods/getAddress');
const generateAddress = require('../../../types/Account/methods/generateAddress');

const {
  HDPrivateKey,
  PrivateKey,
  Transaction,
  MerkleBlock,
} = require('@dashevo/dashcore-lib')

const TransactionSyncStreamWorker = require('./TransactionSyncStreamWorker');
const Storage = require('../../../types/Storage/Storage');
const KeyChain = require('../../../types/KeyChain/KeyChain');

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

  end() {}
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
  let walletType;
  let accountMock;
  let streamMock;
  let address;
  let network;
  let addressAtIndex19;
  let keyChain;
  let testHDKey;

  beforeEach(function beforeEach() {
    network = 'testnet';
    testHDKey = "xprv9s21ZrQH143K4PgfRZPuYjYUWRZkGfEPuWTEUESMoEZLC274ntC4G49qxgZJEPgmujsmY52eVggtwZgJPrWTMXmbYgqDVySWg46XzbGXrSZ";

    streamMock = new StreamMock();

    walletType = WALLET_TYPES.HDWALLET;

    storage = new Storage();
    keyChain = new KeyChain({ HDPrivateKey: new HDPrivateKey(testHDKey) });

    addressAtIndex19 =
    testHDKey = new HDPrivateKey(testHDKey).toString();
    mockParentEmitter = Object.create(EventEmitter.prototype);
    storage.createWallet();
    walletId = Object.keys(storage.store.wallets)[0];

    accountMock = new EventEmitter();
    Object.assign(accountMock, {
      transport: {
        getBestBlockHeight: this.sinonSandbox.stub().returns(42),
        subscribeToTransactionsWithProofs: this.sinonSandbox.stub().returns(streamMock),
      },
      storage,
      keyChain,
      store: storage.getStore(),
      walletId,
      walletType,
      network,
      BIP44PATH,
      getAddress,
      importTransactions,
      generateAddress,
    });

    // That sets the last synced block
    storage.store.wallets[walletId].accounts[BIP44PATH] = {};

    worker = new TransactionSyncStreamWorker();

    Object.assign(worker, accountMock);

    worker.setLastSyncedBlockHeight(1);
    worker.parentEvents = mockParentEmitter;

    address = accountMock.getAddress(0).address;
    addressAtIndex19 = accountMock.getAddress(19).address;
  });

  afterEach(() => {
    worker.stopWorker();
  })

  describe("#onStart", () => {
    it('should sync historical data from the last saved block', async function () {
      const lastSavedBlockHeight = 40;
      const bestBlockHeight = 42;

      worker.setLastSyncedBlockHeight(lastSavedBlockHeight);
      const transactionsSent = [];

      accountMock.transport.getBestBlockHeight
        .returns(bestBlockHeight);

      setTimeout(() => {
        try {
          expect(worker.stream).is.not.null;

          //const merkleBlock = new MerkleBlock();

          for (let i = lastSavedBlockHeight; i <= bestBlockHeight; i++) {
            const transaction = new Transaction()
              .to(address, i);

            transactionsSent.push(transaction);
            streamMock.emit(StreamMock.EVENTS.data, new StreamDataResponse({
              rawTransactions: [transaction.toBuffer()]
            }));
          }

          streamMock.emit(StreamMock.EVENTS.end);
        } catch (e) {
          console.error(e);
          streamMock.emit(StreamMock.EVENTS.error, e);
        }
      }, 10);

      await worker.onStart();

      const transactionsInStorage = Object
          .values(storage.getStore().transactions)
          .map((t) => t.toJSON());

      const expectedTransactions = transactionsSent
          .map((t) => t.toJSON());

      expect(worker.stream).to.be.null;
      expect(transactionsInStorage.length).to.be.equal(3);
      expect(transactionsInStorage).to.have.deep.members(expectedTransactions);
    });
    it('should reconnect to the historical stream when gap limit is filled', async function () {
      const lastSavedBlockHeight = 40;
      const bestBlockHeight = 42;

      worker.setLastSyncedBlockHeight(lastSavedBlockHeight);
      const transactionsSent = [];

      accountMock.transport.getBestBlockHeight
        .returns(bestBlockHeight);

      setTimeout(() => {
        try {
          expect(worker.stream).is.not.null;

          //const merkleBlock = new MerkleBlock();

          for (let i = lastSavedBlockHeight; i <= bestBlockHeight; i++) {
            const transaction = new Transaction()
                .to(addressAtIndex19, i);

            transactionsSent.push(transaction);
            streamMock.emit(StreamMock.EVENTS.data, new StreamDataResponse({
              rawTransactions: [transaction.toBuffer()]
            }));
          }

          streamMock.emit(StreamMock.EVENTS.end);
        } catch (e) {
          console.error(e);
          streamMock.emit(StreamMock.EVENTS.error, e);
        }
      }, 10);

      await worker.onStart();

      const transactionsInStorage = Object
          .values(storage.getStore().transactions)
          .map((t) => t.toJSON());

      const expectedTransactions = transactionsSent
          .map((t) => t.toJSON());


      const addressesInStorage = storage.getStore().wallets[walletId].addresses.external;
      expect(Object.keys(addressesInStorage).length).to.be.equal(21);
      expect(worker.stream).to.be.null;
      expect(transactionsInStorage.length).to.be.equal(3);
      expect(transactionsInStorage).to.have.deep.members(expectedTransactions);
    });
    it("should sync historical data from the genesis if there's no previous sync data", async function () {
      expect.fail("Not implemented");
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

  describe("#execute", () => {
    it('should sync incoming transactions and save it to the storage', async function () {
      const lastSavedBlockHeight = 59;
      const bestBlockHeight = 61;

      const transactionsSent = [];

      accountMock.transport.getBestBlockHeight
          .returns(bestBlockHeight);

      setTimeout(() => {
        try {
          expect(worker.stream).is.not.null;

          for (let i = lastSavedBlockHeight; i <= bestBlockHeight; i++) {
            const transaction = new Transaction()
                .to(address, i);

            transactionsSent.push(transaction);
            streamMock.emit(StreamMock.EVENTS.data, new StreamDataResponse({
              rawTransactions: [transaction.toBuffer()]
            }));
          }

          streamMock.emit(StreamMock.EVENTS.end);
        } catch (e) {
          console.error(e);
          streamMock.emit(StreamMock.EVENTS.error, e);
        }
      }, 10);

      await worker.execute();

      const transactionsInStorage = Object
          .values(storage.getStore().transactions)
          .map((t) => t.toJSON());

      const expectedTransactions = transactionsSent
          .map((t) => t.toJSON());

      expect(worker.stream).to.be.null;
      expect(transactionsInStorage.length).to.be.equal(3);
      expect(transactionsInStorage).to.have.deep.members(expectedTransactions);
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
