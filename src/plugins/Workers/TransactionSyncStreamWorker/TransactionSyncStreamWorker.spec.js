const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const EventEmitter = require('events');
const { WALLET_TYPES } = require('../../../CONSTANTS');
const importTransactions = require('../../../types/Account/methods/importTransactions');
const getAddress = require('../../../types/Account/methods/getAddress');
const generateAddress = require('../../../types/Account/methods/generateAddress');
const importBlockHeader = require('../../../types/Account/methods/importBlockHeader');
const _initializeAccount = require('../../../types/Account/_initializeAccount');

const {
  HDPrivateKey,
  Transaction,
} = require('@dashevo/dashcore-lib')

const TransactionSyncStreamWorker = require('./TransactionSyncStreamWorker');
const Storage = require('../../../types/Storage/Storage');
const KeyChain = require('../../../types/KeyChain/KeyChain');

chai.use(chaiAsPromised);
const { expect } = chai;

function wait(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

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
        return rawTransactions || [];
      }
    };
  }
}

class StreamMock extends EventEmitter {
  constructor() {
    super();
  }

  cancel() {
    let err = new Error();
    err.code = 2;
    this.emit(StreamMock.EVENTS.error, err);
  }

  end() {
    this.emit('end');
    this.removeAllListeners();
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
  let walletType;
  let accountMock;
  let streamMock;
  let address;
  let network;
  let addressAtIndex19;
  let keyChain;
  let testHDKey;
  let merkleBlockBuffer;

  beforeEach(function beforeEach() {
    network = 'testnet';
    testHDKey = "xprv9s21ZrQH143K4PgfRZPuYjYUWRZkGfEPuWTEUESMoEZLC274ntC4G49qxgZJEPgmujsmY52eVggtwZgJPrWTMXmbYgqDVySWg46XzbGXrSZ";
    merkleBlockBuffer = Buffer.from([0,0,0,32,61,11,102,108,38,155,164,49,91,246,141,178,126,155,13,118,248,83,250,15,206,21,102,65,104,183,243,167,235,167,60,113,140,110,120,87,208,191,240,19,212,100,228,121,192,125,143,44,226,9,95,98,51,25,139,172,175,27,205,201,158,85,37,8,72,52,36,95,255,255,127,32,2,0,0,0,1,0,0,0,1,140,110,120,87,208,191,240,19,212,100,228,121,192,125,143,44,226,9,95,98,51,25,139,172,175,27,205,201,158,85,37,8,1,1]);

    streamMock = new StreamMock();

    walletType = WALLET_TYPES.HDWALLET;

    storage = new Storage();
    keyChain = new KeyChain({ HDPrivateKey: new HDPrivateKey(testHDKey) });

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
      injectDefaultPlugins: true,
      storage,
      keyChain,
      store: storage.store,
      walletId,
      walletType,
      index: 0,
      network,
      BIP44PATH,
      getAddress,
      importTransactions,
      generateAddress,
      importBlockHeader,
      injectPlugin: this.sinonSandbox.stub(),
      plugins: {
        watchers: [],
      },
      state: {}
    });

    _initializeAccount(accountMock, []);

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

      setTimeout(async () => {
        try {
          expect(worker.stream).is.not.null;

          for (let i = lastSavedBlockHeight; i <= bestBlockHeight; i++) {
            const transaction = new Transaction().to(address, i);

            transactionsSent.push(transaction);
            streamMock.emit(StreamMock.EVENTS.data, new StreamDataResponse({
              rawTransactions: [transaction.toBuffer()]
            }));
            await wait(10);
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

      setTimeout(async () => {
        try {
          expect(worker.stream).is.not.null;

          const transaction = new Transaction().to(addressAtIndex19, 10000);

          streamMock.emit(StreamMock.EVENTS.data, new StreamDataResponse({
            rawMerkleBlock: merkleBlockBuffer
          }));

          await wait(10);

          transactionsSent.push(transaction);
          streamMock.emit(StreamMock.EVENTS.data, new StreamDataResponse({
            rawTransactions: [transaction.toBuffer()]
          }));

          await wait(10);

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


      const addressesInStorage = storage.store.wallets[walletId].addresses.external;
      // We send transaction to index 19, so wallet should generate additional 20 addresses to keep the gap between
      // the last used address
      expect(Object.keys(addressesInStorage).length).to.be.equal(40);
      // It should reconnect after the gap limit is reached
      expect(accountMock.transport.subscribeToTransactionsWithProofs.callCount).to.be.equal(2);
      // 20 external and 20 internal
      expect(accountMock.transport.subscribeToTransactionsWithProofs.firstCall.args[0].length).to.be.equal(40);
      expect(accountMock.transport.subscribeToTransactionsWithProofs.firstCall.args[1]).to.be.deep.equal({ fromBlockHeight: 40, count: 2});
      // 20 more of each type, since the last address is used
      expect(accountMock.transport.subscribeToTransactionsWithProofs.secondCall.args[0].length).to.be.equal(80);
      expect(accountMock.transport.subscribeToTransactionsWithProofs.secondCall.args[1]).to.be.deep.equal({ fromBlockHash: '5e55b2ca5472098231965e87a80b35750554ad08d5a1357800b7cd0dfa153646', count: 2});

      expect(worker.stream).to.be.null;
      expect(transactionsInStorage.length).to.be.equal(1);
      expect(transactionsInStorage).to.have.deep.members(expectedTransactions);
    });

    it('should reconnect to the historical stream if stream is closed due to operational GRPC error', async function () {
      const lastSavedBlockHeight = 40;
      const bestBlockHeight = 42;

      worker.setLastSyncedBlockHeight(lastSavedBlockHeight);
      const transactionsSent = [];

      accountMock.transport.getBestBlockHeight
          .returns(bestBlockHeight);

      setTimeout(async () => {
        expect(worker.stream).is.not.null;

        const err = new Error('Some error');
        err.code = 4;
        streamMock.emit(StreamMock.EVENTS.error, err);

        await wait(10);

        streamMock.emit(StreamMock.EVENTS.end);
      }, 10);

      await worker.onStart();

      const addressesInStorage = storage.store.wallets[walletId].addresses.external;

      expect(Object.keys(addressesInStorage).length).to.be.equal(20);
      // It should reconnect after because of the operational error
      expect(accountMock.transport.subscribeToTransactionsWithProofs.callCount).to.be.equal(2);
      // 20 external and 20 internal
      expect(accountMock.transport.subscribeToTransactionsWithProofs.firstCall.args[0].length).to.be.equal(40);
      expect(accountMock.transport.subscribeToTransactionsWithProofs.firstCall.args[1]).to.be.deep.equal({ fromBlockHeight: 40, count: 2});

      expect(accountMock.transport.subscribeToTransactionsWithProofs.secondCall.args[0].length).to.be.equal(40);
      expect(accountMock.transport.subscribeToTransactionsWithProofs.secondCall.args[1]).to.be.deep.equal({ fromBlockHeight: 40, count: 2});

      expect(worker.stream).to.be.null;
    });

    it('should not reconnect to the historical stream if stream in case of any other error', async function () {
      const lastSavedBlockHeight = 40;
      const bestBlockHeight = 42;

      worker.setLastSyncedBlockHeight(lastSavedBlockHeight);
      const transactionsSent = [];

      accountMock.transport.getBestBlockHeight
          .returns(bestBlockHeight);

      setTimeout(async () => {
        expect(worker.stream).is.not.null;

        streamMock.emit(StreamMock.EVENTS.error, new Error('Some random error'));
      }, 10);

      await expect(worker.onStart()).to.be.rejectedWith('Some random error');

      const addressesInStorage = storage.store.wallets[walletId].addresses.external;

      expect(Object.keys(addressesInStorage).length).to.be.equal(20);
      // Shouldn't try to reconnect
      expect(accountMock.transport.subscribeToTransactionsWithProofs.callCount).to.be.equal(1);
      // 20 external and 20 internal
      expect(accountMock.transport.subscribeToTransactionsWithProofs.firstCall.args[0].length).to.be.equal(40);
      expect(accountMock.transport.subscribeToTransactionsWithProofs.firstCall.args[1]).to.be.deep.equal({ fromBlockHeight: 40, count: 2});

      expect(worker.stream).to.be.null;
    });
  });

  describe("#execute", () => {
    it('should sync incoming transactions and save it to the storage', async function () {
      const lastSavedBlockHeight = 40;
      const bestBlockHeight = 42;

      worker.setLastSyncedBlockHeight(lastSavedBlockHeight);
      const transactionsSent = [];

      accountMock.transport.getBestBlockHeight
          .returns(bestBlockHeight);

      worker.execute();

      await wait(10);

      try {
        for (let i = lastSavedBlockHeight; i <= bestBlockHeight; i++) {
          const transaction = new Transaction().to(address, i);

          transactionsSent.push(transaction);
          streamMock.emit(StreamMock.EVENTS.data, new StreamDataResponse({
            rawTransactions: [transaction.toBuffer()]
          }));
          await wait(10);
        }

        streamMock.emit(StreamMock.EVENTS.end);
      } catch (e) {
        console.error(e);
        streamMock.emit(StreamMock.EVENTS.error, e);
      }

      await worker.onStop();

      const transactionsInStorage = Object
          .values(storage.getStore().transactions)
          .map((t) => t.toJSON());

      const expectedTransactions = transactionsSent
          .map((t) => t.toJSON());

      expect(worker.stream).to.be.null;
      expect(transactionsInStorage.length).to.be.equal(3);
      expect(transactionsInStorage).to.have.deep.members(expectedTransactions);
    })
    it('should reconnect to the incoming stream when gap limit is filled', async function () {
      const lastSavedBlockHeight = 40;
      const bestBlockHeight = 42;

      worker.setLastSyncedBlockHeight(lastSavedBlockHeight);
      const transactionsSent = [];

      accountMock.transport.getBestBlockHeight
          .returns(bestBlockHeight);

      worker.execute();

      await wait(10);

      try {
        const transaction = new Transaction().to(addressAtIndex19, 10000);

        streamMock.emit(StreamMock.EVENTS.data, new StreamDataResponse({
          rawMerkleBlock: merkleBlockBuffer
        }));

        await wait(10);

        transactionsSent.push(transaction);
        streamMock.emit(StreamMock.EVENTS.data, new StreamDataResponse({
          rawTransactions: [transaction.toBuffer()]
        }));

        await wait(10);

        streamMock.emit(StreamMock.EVENTS.end);
      } catch (e) {
        console.error(e);
        streamMock.emit(StreamMock.EVENTS.error, e);
      }

      await worker.onStop();

      const transactionsInStorage = Object
          .values(storage.getStore().transactions)
          .map((t) => t.toJSON());

      const expectedTransactions = transactionsSent
          .map((t) => t.toJSON());

      const addressesInStorage = storage.store.wallets[walletId].addresses.external;
      // We send transaction to index 19, so wallet should generate additional 20 addresses to keep the gap between
      // the last used address
      expect(Object.keys(addressesInStorage).length).to.be.equal(40);
      // It should reconnect after the gap limit is reached
      expect(accountMock.transport.subscribeToTransactionsWithProofs.callCount).to.be.equal(2);
      // 20 external and 20 internal
      expect(accountMock.transport.subscribeToTransactionsWithProofs.firstCall.args[0].length).to.be.equal(40);
      expect(accountMock.transport.subscribeToTransactionsWithProofs.firstCall.args[1]).to.be.deep.equal({ fromBlockHeight: 40, count: 0});
      // 20 more of each type, since the last address is used
      expect(accountMock.transport.subscribeToTransactionsWithProofs.secondCall.args[0].length).to.be.equal(80);
      expect(accountMock.transport.subscribeToTransactionsWithProofs.secondCall.args[1]).to.be.deep.equal({ fromBlockHash: '5e55b2ca5472098231965e87a80b35750554ad08d5a1357800b7cd0dfa153646', count: 0});

      expect(worker.stream).to.be.null;
      expect(transactionsInStorage.length).to.be.equal(1);
      expect(transactionsInStorage).to.have.deep.members(expectedTransactions);
    });

    it('should reconnect to the incoming stream if stream is closed due to operational GRPC error', async function () {
      const lastSavedBlockHeight = 40;
      const bestBlockHeight = 42;

      worker.setLastSyncedBlockHeight(lastSavedBlockHeight);

      accountMock.transport.getBestBlockHeight
          .returns(bestBlockHeight);

      worker.execute();

      await wait(10);

      const err = new Error('Some error');
      err.code = 4;
      streamMock.emit(StreamMock.EVENTS.error, err);

      await wait(10);

      streamMock.emit(StreamMock.EVENTS.end);

      await worker.onStop();

      const addressesInStorage = storage.store.wallets[walletId].addresses.external;

      expect(Object.keys(addressesInStorage).length).to.be.equal(20);
      // It should reconnect after the gap limit is reached
      expect(accountMock.transport.subscribeToTransactionsWithProofs.callCount).to.be.equal(2);
      // 20 external and 20 internal
      expect(accountMock.transport.subscribeToTransactionsWithProofs.firstCall.args[0].length).to.be.equal(40);
      expect(accountMock.transport.subscribeToTransactionsWithProofs.firstCall.args[1]).to.be.deep.equal({ fromBlockHeight: 40, count: 0});

      expect(accountMock.transport.subscribeToTransactionsWithProofs.secondCall.args[0].length).to.be.equal(40);
      expect(accountMock.transport.subscribeToTransactionsWithProofs.secondCall.args[1]).to.be.deep.equal({ fromBlockHeight: 40, count: 0});

      expect(worker.stream).to.be.null;
    });
    it('should reconnect to the server closes the stream without any errors', async function () {
      const lastSavedBlockHeight = 40;
      const bestBlockHeight = 42;

      worker.setLastSyncedBlockHeight(lastSavedBlockHeight);

      accountMock.transport.getBestBlockHeight
          .returns(bestBlockHeight);

      worker.execute();

      await wait(10);

      streamMock.emit(StreamMock.EVENTS.end);

      await wait(10);

      await worker.onStop();

      const addressesInStorage = storage.store.wallets[walletId].addresses.external;

      expect(Object.keys(addressesInStorage).length).to.be.equal(20);
      // It should reconnect if the server closes the stream
      expect(accountMock.transport.subscribeToTransactionsWithProofs.callCount).to.be.equal(2);
      // 20 external and 20 internal
      expect(accountMock.transport.subscribeToTransactionsWithProofs.firstCall.args[0].length).to.be.equal(40);
      expect(accountMock.transport.subscribeToTransactionsWithProofs.firstCall.args[1]).to.be.deep.equal({ fromBlockHeight: 40, count: 0});

      expect(accountMock.transport.subscribeToTransactionsWithProofs.secondCall.args[0].length).to.be.equal(40);
      expect(accountMock.transport.subscribeToTransactionsWithProofs.secondCall.args[1]).to.be.deep.equal({ fromBlockHeight: 40, count: 0});

      expect(worker.stream).to.be.null;
    });

    it('should not reconnect to the incoming stream if stream in case of any other error', async function () {
      const lastSavedBlockHeight = 40;
      const bestBlockHeight = 42;

      worker.setLastSyncedBlockHeight(lastSavedBlockHeight);

      accountMock.transport.getBestBlockHeight
          .returns(bestBlockHeight);

      worker.execute();

      await wait(10);

      streamMock.emit(StreamMock.EVENTS.error, new Error('Some random error'));

      await wait(10);

      await worker.onStop();

      await expect(worker.incomingSyncPromise).to.be.rejectedWith('Some random error');

      const addressesInStorage = storage.store.wallets[walletId].addresses.external;
      expect(Object.keys(addressesInStorage).length).to.be.equal(20);

      // Shouldn't try to reconnect
      expect(accountMock.transport.subscribeToTransactionsWithProofs.callCount).to.be.equal(1);
      // 20 external and 20 internal
      expect(accountMock.transport.subscribeToTransactionsWithProofs.firstCall.args[0].length).to.be.equal(40);
      expect(accountMock.transport.subscribeToTransactionsWithProofs.firstCall.args[1]).to.be.deep.equal({ fromBlockHeight: 40, count: 0});

      expect(worker.stream).to.be.null;
    });
  });
});
