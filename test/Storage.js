const { expect } = require('chai');
const Storage = require('../src/Storage');
const InMem = require('../src/adapters/InMem');

const adapter = new InMem();
const storageOpts = {
  adapter,
};
describe('Storage', function suite() {
  this.timeout(50000);
  it('should create a new storage without options', () => {
    const store2 = new Storage();
    expect(store2).to.exist;
    store2.stopWorker();
  });
  it('should create a new storage with options', () => {
    const store = new Storage(storageOpts);

    expect(store).to.exist;
    expect(store.adapter).to.deep.equal(adapter);
    expect(store.store).to.deep.equal({
      transactions: {},
      addresses: {
        internal: {},
        external: {},
        misc: {},
      },
      accounts: {},
    });
    expect(store.lastRehydrate).to.equal(null);
    expect(store.lastSave).to.equal(null);
    expect(store.lastModified).to.equal(null);
    expect(store.interval).to.exist;
    store.stopWorker();
  });
  it('should import a tx', () => {
    const store = new Storage(storageOpts);
    const tx = {
      blockhash: '000000000a84c4703da7a69cfa65837251e4aac80e1621f2a2cc9504e0c149ba',
      blockheight: 201436,
      blocktime: 1533525448,
      fees: 0.0001,
      size: 225,
      txid: '9ab39713e9ce713d41ca6974db83e57bced02402e9516b8a662ed60d5c08f6d1',
      txlock: true,
    };


    const result = store.importTransactions(tx);
    expect(result).to.equal(true);
    expect(store.store.transactions[tx.txid]).to.deep.equal(tx);
    store.stopWorker();
  });

  it('should import multiple txs', () => {
    const store = new Storage(storageOpts);



    expect(() => store.importTransactions([])).to.throw('Not implemented. Please create an issue on github if needed.');
    expect(() => store.importTransactions(12)).to.throw('Not implemented. Please create an issue on github if needed.');
    store.stopWorker();

  });
  it('should import a addr', () => {
    const store = new Storage(storageOpts);
    const addr = {
      address: 'yLmv6uX1jmn14pCDpc83YCsA8wHVtcbaNw',
      balance: 0,
      fetchedLast: 1533527600644,
      path: "m/44'/1'/0'/0/19",
      transactions:
      [],
      utxos: [],
    };
    const result = store.importAddresses(addr);
    expect(result).to.equal(true);
    expect(store.store.addresses.external[addr.path]).to.deep.equal(addr);

    store.stopWorker();
  });
  it('should import multiples addrs', () => {
    const store = new Storage(storageOpts);
    const addrs = {
      "m/44'/1'/0'/0/18": {
        address: '"yTf25xm2t4PeppBpuuGEJktQTYnCaBZ7zE"',
        balance: 0,
        fetchedLast: 1533527600644,
        path: "m/44'/1'/0'/0/18",
        transactions:
        [],
        utxos: [],
      },
      "m/44'/1'/0'/0/19": {
        address: 'yLmv6uX1jmn14pCDpc83YCsA8wHVtcbaNw',
        balance: 0,
        fetchedLast: 1533527600644,
        path: "m/44'/1'/0'/0/19",
        transactions:
        [],
        utxos: [],
      },
      "m/44'/1'/0'/1/0": {
        address: 'yihFsR46sPoFgs43hW652Uw9gm1QmvcWor',
        balance: 0,
        fetchedLast: 1533527600689,
        path: "m/44'/1'/0'/1/0",
        transactions: [],
        utxos: [],
      },
      "m/44'/1'/0'/4/19": {
        address: 'misc',
        balance: 0,
        fetchedLast: 1533527600644,
        path: "m/44'/1'/0'/4/19",
        transactions:
          [],
        utxos: [],
      },


    };
    const result = store.importAddresses(addrs);
    expect(result).to.equal(true);
    expect(store.store.addresses.external['m/44\'/1\'/0\'/0/18']).to.deep.equal(addrs['m/44\'/1\'/0\'/0/18']);
    expect(store.store.addresses.external['m/44\'/1\'/0\'/0/19']).to.deep.equal(addrs['m/44\'/1\'/0\'/0/19']);


    expect(() => store.importAddresses([])).to.throw('Not implemented. Please create an issue on github if needed.');
    expect(() => store.importAddresses(12)).to.throw('Not implemented. Please create an issue on github if needed.');

    store.stopWorker();
  });
  it('should import an account', () => {
    const store = new Storage(storageOpts);
    const acc = {
      label: 'uberAcc',
      network: 'testnet',
      path: "m/44'/1'/0'",
    };

    const result = store.importAccounts(acc);
    expect(result).to.equal(true);
    expect(store.store.accounts[acc.path]).to.deep.equal(acc);
    store.stopWorker();
  });
  it('should import multiples account', () => {
    const store = new Storage(storageOpts);
    const accounts = {
      "m/44'/1'/0'":{
          label: 'uberAcc',
          network: 'testnet',
          path: "m/44'/1'/0'",
        },
        "m/44'/1'/1'":{
          label: 'uberAcc2',
          network: 'testnet',
          path: "m/44'/1'/1'",
        }
      }


    const result = store.importAccounts(accounts);
    expect(result).to.equal(true);
    expect(store.store.accounts["m/44'/1'/0'"]).to.deep.equal(accounts["m/44'/1'/0'"]);
    expect(store.store.accounts["m/44'/1'/1'"]).to.deep.equal(accounts["m/44'/1'/1'"]);
    expect(() => store.importAccounts([])).to.throw('Not implemented. Please create an issue on github if needed.');
    expect(() => store.importAccounts(12)).to.throw('Not implemented. Please create an issue on github if needed.');

    store.stopWorker();
    });
  it('should get a store', () => {
    const store = new Storage(storageOpts);
    const acc = {
      label: 'uberAcc',
      network: 'testnet',
      path: "m/44'/1'/0'",
    };

    store.importAccounts(acc);
    const result = store.getStore();

    const expectedResult = {
      transactions: {},
      addresses: {
        internal: {},
        external: {},
        misc: {},
      },
      accounts: {
        "m/44'/1'/0'": {
          label: 'uberAcc',
          network: 'testnet',
          path: "m/44'/1'/0'",
        },
      },
    };

    expect(result).to.deep.equal(expectedResult);
    store.stopWorker();
  });
  it('should save a state', (done) => {
    const store = new Storage(storageOpts);
    store.saveState().then((result) => {
      const expectedResult = true;
      expect(result).to.equal(expectedResult);
      expect(store.lastSave).to.be.greaterThan(1533542388913);
      done();
    });
    store.stopWorker();
  });
  it('should stop a worker', () => {
    const store = new Storage(storageOpts);
    const result = store.stopWorker();
    const expected = true;
    expect(result).to.equal(expected);
    expect(store.interval).to.equal(null);
  });
});
