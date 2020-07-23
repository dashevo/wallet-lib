const { expect } = require('chai');
const TransactionSyncStreamWorker = require('./TransactionSyncStreamWorker');
const Storage = require('../../../types/Storage/Storage');
const EventEmitter = require('events');

describe('Workers - TransactionSyncStreamWorker', function suite() {
  this.timeout(60000);
  let worker;
  let mockParentEmitter = Object.create(EventEmitter.prototype);


  const storage = new Storage();
  storage.createWallet();

  let mockParent = {
    transport: {},
    storage,
    walletId: Object.keys(storage.store.wallets)[0],
    getAddress: ()=> {},
    network: 'testnet',
    BIP44PATH: `m/44'/1'/0'`
  }

  it('should initiate', () => {
    worker = new TransactionSyncStreamWorker();
    Object.assign(worker, mockParent);
    worker.parentEvents = mockParentEmitter;
  });
  it('should start', async function () {
    await worker.startWorker();
    // Test that we do try to read from storage the last best block height ?
    await new Promise(((resolve, reject) => {
      setTimeout(resolve, 1000000);
    }))
  });
  it('should stop', async function () {
    await worker.stopWorker();
  });
});
