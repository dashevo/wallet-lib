const { expect } = require('chai');
const TransactionSyncStreamWorker = require('./TransactionSyncStreamWorker');
const Storage = require('../../../types/Storage/Storage');
const EventEmitter = require('events');

const BIP44PATH = `m/44'/1'/0'`

describe('TransactionSyncStreamWorker', function suite() {
  this.timeout(60000);
  let worker;
  let mockParentEmitter;
  let storage;
  let walletId;
  let dependenciesMock;

  beforeEach(() => {
    storage = new Storage();
    mockParentEmitter = Object.create(EventEmitter.prototype);
    storage.createWallet();
    walletId = Object.keys(storage.store.wallets)[0];
    dependenciesMock = {
      transport: {
        getBestBlockHeight: () => 42,
        subscribeToTransactionsWithProofs: (addrList) => true
      },
      storage,
      walletId,
      getAddress: () => {},
      network: 'testnet',
      BIP44PATH
    }
    storage.store.wallets[walletId].accounts[BIP44PATH] = {

    }
    worker = new TransactionSyncStreamWorker();

    Object.assign(worker, dependenciesMock);
    worker.parentEvents = mockParentEmitter;
  });

  afterEach(() => {
    worker.stopWorker();
  })

  it('should initiate', () => {

  });

  describe("Historical data", () => {
    it('should sync historical data from the last saved block', async function () {
      worker
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
      expect.fail('Not implemented');
    })
    it('should receive own sent transactions and save it to the storage', async function () {
      expect.fail('Not implemented');
    });
    it('should start incoming transaction sync after all historical data is retrieved', async function () {
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
