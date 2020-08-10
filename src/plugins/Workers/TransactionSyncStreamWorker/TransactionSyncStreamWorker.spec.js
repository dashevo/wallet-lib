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
  const walletId = Object.keys(storage.store.wallets)[0];
  const BIP44PATH = `m/44'/1'/0'`
  let mockParent = {
    transport: {
      getBestBlockHeight:()=> 42,
      subscribeToTransactionsWithProofs: (addrList) => true
    },
    storage,
    walletId,
    getAddress: ()=> {},
    network: 'testnet',
    BIP44PATH
  }
  storage.store.wallets[walletId].accounts[BIP44PATH] = {

  }

  it('should initiate', () => {
    worker = new TransactionSyncStreamWorker();
    Object.assign(worker, mockParent);
    worker.parentEvents = mockParentEmitter;
  });
  it('should start', async function () {
    worker.setLastSyncedBlockHeight(0);

    await worker.startWorker();
    // Test that we do try to read from storage the last best block height ?
    await new Promise(((resolve, reject) => {
      setTimeout(resolve, 1000000);
    }))
  });
  it.skip('should stop', async function () {
    await worker.stopWorker();
  });
  it('should sync historical data', async function () {
    expect.fail('Not implemented');
  });
  it('should reconnect to the historical stream when gap limit is filled', async function () {
    expect.fail('Not implemented');
  });
  it('should reconnect to the historical stream if stream is closed with an error', async function () {
    expect.fail('Not implemented');
  });
  it('should reconnect to the historical stream if stream is closed by the server', async function () {
    expect.fail('Not implemented');
  });
});
