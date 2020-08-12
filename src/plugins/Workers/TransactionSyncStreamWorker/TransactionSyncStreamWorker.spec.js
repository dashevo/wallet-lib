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
    address = "yXswboqtttE8qUMbxZTYKqxJB9NZExQB7R";

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
      importTransactions: (...args) => { storage.importTransactions(...args) }
    }

    storage.store.wallets[walletId].accounts[BIP44PATH] = {};
    storage.store.wallets[walletId].addresses = {
      "external": {
        "m/44'/1'/0'/0/0": {
          "path": "m/44'/1'/0'/0/0",
          "index": 0,
          "address": "yXswboqtttE8qUMbxZTYKqxJB9NZExQB7R",
          "transactions": [],
          "balanceSat": 0,
          "unconfirmedBalanceSat": 0,
          "utxos": {},
          "fetchedLast": 0,
          "used": false
        },
        "m/44'/1'/0'/0/1": {
          "path": "m/44'/1'/0'/0/1",
          "index": 1,
          "address": "yYfSuEu8P4tUgtyps11gLUVyvttCiq3Gwo",
          "transactions": [],
          "balanceSat": 0,
          "unconfirmedBalanceSat": 0,
          "utxos": {},
          "fetchedLast": 0,
          "used": false
        },
        "m/44'/1'/0'/0/2": {
          "path": "m/44'/1'/0'/0/2",
          "index": 2,
          "address": "ybRa2jbhJbgLXby7xz97PrQRLkLqyeGf2k",
          "transactions": [],
          "balanceSat": 0,
          "unconfirmedBalanceSat": 0,
          "utxos": {},
          "fetchedLast": 0,
          "used": false
        },
        "m/44'/1'/0'/0/3": {
          "path": "m/44'/1'/0'/0/3",
          "index": 3,
          "address": "yQwfiRd1wHBxtn4ki8pBLVjZzuc6NYGhYa",
          "transactions": [],
          "balanceSat": 0,
          "unconfirmedBalanceSat": 0,
          "utxos": {},
          "fetchedLast": 0,
          "used": false
        },
        "m/44'/1'/0'/0/4": {
          "path": "m/44'/1'/0'/0/4",
          "index": 4,
          "address": "ygm5wsfuJ4pGk34G5h1P34xts7zGMwioa9",
          "transactions": [],
          "balanceSat": 0,
          "unconfirmedBalanceSat": 0,
          "utxos": {},
          "fetchedLast": 0,
          "used": false
        },
        "m/44'/1'/0'/0/5": {
          "path": "m/44'/1'/0'/0/5",
          "index": 5,
          "address": "ybV7n5bxWupPTPBxWRzuacneqRQU2UH9jN",
          "transactions": [],
          "balanceSat": 0,
          "unconfirmedBalanceSat": 0,
          "utxos": {},
          "fetchedLast": 0,
          "used": false
        },
        "m/44'/1'/0'/0/6": {
          "path": "m/44'/1'/0'/0/6",
          "index": 6,
          "address": "ydctvsEEDeBxo3uipJPvqjkWCsNGCWvT9K",
          "transactions": [],
          "balanceSat": 0,
          "unconfirmedBalanceSat": 0,
          "utxos": {},
          "fetchedLast": 0,
          "used": false
        },
        "m/44'/1'/0'/0/7": {
          "path": "m/44'/1'/0'/0/7",
          "index": 7,
          "address": "yRkTni2zuqGSwku7gpz4r1WHw6io3bTjhz",
          "transactions": [],
          "balanceSat": 0,
          "unconfirmedBalanceSat": 0,
          "utxos": {},
          "fetchedLast": 0,
          "used": false
        },
        "m/44'/1'/0'/0/8": {
          "path": "m/44'/1'/0'/0/8",
          "index": 8,
          "address": "yPgLVocefbnxgcRXfhb6pSsXWqBbT7nUUg",
          "transactions": [],
          "balanceSat": 0,
          "unconfirmedBalanceSat": 0,
          "utxos": {},
          "fetchedLast": 0,
          "used": false
        },
        "m/44'/1'/0'/0/9": {
          "path": "m/44'/1'/0'/0/9",
          "index": 9,
          "address": "yQL5rZvBWmTvgURxmMqRZYBTr8tFLgHnbm",
          "transactions": [],
          "balanceSat": 0,
          "unconfirmedBalanceSat": 0,
          "utxos": {},
          "fetchedLast": 0,
          "used": false
        },
        "m/44'/1'/0'/0/10": {
          "path": "m/44'/1'/0'/0/10",
          "index": 10,
          "address": "yipMBS1AUBN83trpBqueMkwXeQp7F81Gyi",
          "transactions": [],
          "balanceSat": 0,
          "unconfirmedBalanceSat": 0,
          "utxos": {},
          "fetchedLast": 0,
          "used": false
        },
        "m/44'/1'/0'/0/11": {
          "path": "m/44'/1'/0'/0/11",
          "index": 11,
          "address": "yQUnjLwdLFJCsfdX9EoqBSWP6safGNS2Rk",
          "transactions": [],
          "balanceSat": 0,
          "unconfirmedBalanceSat": 0,
          "utxos": {},
          "fetchedLast": 0,
          "used": false
        },
        "m/44'/1'/0'/0/12": {
          "path": "m/44'/1'/0'/0/12",
          "index": 12,
          "address": "yPDFE2ACMqMVfamFtibRAwiS9XfH3uTFQ2",
          "transactions": [],
          "balanceSat": 0,
          "unconfirmedBalanceSat": 0,
          "utxos": {},
          "fetchedLast": 0,
          "used": false
        },
        "m/44'/1'/0'/0/13": {
          "path": "m/44'/1'/0'/0/13",
          "index": 13,
          "address": "yZ8tiYEe1xF9RKcCKWNEw2naotY8yMSjm8",
          "transactions": [],
          "balanceSat": 0,
          "unconfirmedBalanceSat": 0,
          "utxos": {},
          "fetchedLast": 0,
          "used": false
        },
        "m/44'/1'/0'/0/14": {
          "path": "m/44'/1'/0'/0/14",
          "index": 14,
          "address": "yfAGzSefH8ZZpXo6kBX7jD4jL161yidJ4i",
          "transactions": [],
          "balanceSat": 0,
          "unconfirmedBalanceSat": 0,
          "utxos": {},
          "fetchedLast": 0,
          "used": false
        },
        "m/44'/1'/0'/0/15": {
          "path": "m/44'/1'/0'/0/15",
          "index": 15,
          "address": "yPmUshFRKn6zacEcjdspzhjfepTnJqcsDG",
          "transactions": [],
          "balanceSat": 0,
          "unconfirmedBalanceSat": 0,
          "utxos": {},
          "fetchedLast": 0,
          "used": false
        },
        "m/44'/1'/0'/0/16": {
          "path": "m/44'/1'/0'/0/16",
          "index": 16,
          "address": "yR5naDkvm6r52htNjBvH88ihNEXW19yYuz",
          "transactions": [],
          "balanceSat": 0,
          "unconfirmedBalanceSat": 0,
          "utxos": {},
          "fetchedLast": 0,
          "used": false
        },
        "m/44'/1'/0'/0/17": {
          "path": "m/44'/1'/0'/0/17",
          "index": 17,
          "address": "yV55uAEnjxJsBuSxVPtW5R3xPET1DgmEUD",
          "transactions": [],
          "balanceSat": 0,
          "unconfirmedBalanceSat": 0,
          "utxos": {},
          "fetchedLast": 0,
          "used": false
        },
        "m/44'/1'/0'/0/18": {
          "path": "m/44'/1'/0'/0/18",
          "index": 18,
          "address": "yeJFybdPdWEf9Jz6jF4DqsT5yERPsdGVzb",
          "transactions": [],
          "balanceSat": 0,
          "unconfirmedBalanceSat": 0,
          "utxos": {},
          "fetchedLast": 0,
          "used": false
        },
        "m/44'/1'/0'/0/19": {
          "path": "m/44'/1'/0'/0/19",
          "index": 19,
          "address": "yPmLfbe2YmxUk47GV3Pb4p6iLMHgyBKRS5",
          "transactions": [],
          "balanceSat": 0,
          "unconfirmedBalanceSat": 0,
          "utxos": {},
          "fetchedLast": 0,
          "used": false
        }
      },
      "internal": {},
      "misc": {}
    };

    worker = new TransactionSyncStreamWorker();

    Object.assign(worker, dependenciesMock, storage);
    worker.parentEvents = mockParentEmitter;
  });

  afterEach(() => {
    worker.stopWorker();
  })

  describe("#onStart", () => {
    it('should sync historical data from the last saved block', async function () {
      const lastSavedBlockHeight = 40;
      const bestBlockHeight = 42;

      const transactionsSent = [];

      dependenciesMock.getLastSyncedBlockHeight
        .returns(lastSavedBlockHeight);
      dependenciesMock.transport.getBestBlockHeight
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

  describe("#execute", () => {
    it('should sync incoming transactions and save it to the storage', async function () {
      const lastSavedBlockHeight = 59;
      const bestBlockHeight = 61;

      const transactionsSent = [];

      dependenciesMock.getLastSyncedBlockHeight
          .returns(lastSavedBlockHeight);
      dependenciesMock.transport.getBestBlockHeight
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
