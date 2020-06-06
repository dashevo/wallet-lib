const {Transaction} = require('@dashevo/dashcore-lib');
const {expect} = require('chai');
const TransactionOrderer = require('./TransactionOrderer');
const transactionsFixtures = require('../../../../../fixtures/plugins/SyncWorker/transactions.set.1.json');

const tx0 = new Transaction(transactionsFixtures[0]); // Predecessor : none; Successor : tx1
const tx1 = new Transaction(transactionsFixtures[1]); // Predecessor : tx0; Successor : tx21
const tx2 = new Transaction(transactionsFixtures[2]); // Predecessor : none; Successor : tx3 & tx4 (duplicate)
const tx3 = new Transaction(transactionsFixtures[3]); // Predecessor: tx2;
const tx4 = new Transaction(transactionsFixtures[4]); // Duplicate of tx3;
const tx21 = new Transaction(transactionsFixtures[21]); // Predecessor: tx1; Successor: tx41
const tx22 = new Transaction(transactionsFixtures[22]); // has prevTxId from tx41
const tx23 = new Transaction(transactionsFixtures[23]); // has prevTxId from tx22
const tx33 = new Transaction(transactionsFixtures[33]);
const tx41 = new Transaction(transactionsFixtures[41]); // Predecssesor: tx21

describe('SyncWorker - utils - TransactionOrderer', () => {
  let transactionOrderer;
  before(() => {
    transactionOrderer = new TransactionOrderer();
  })
  describe.skip(".insertion simple", () => {
    it('should handle wrong input', function () {
      const expectedException = `Expect input of type Transaction`;

      expect(() => transactionOrderer.insert(null)).to.throw(expectedException);
      expect(() => transactionOrderer.insert(true)).to.throw(expectedException);
      expect(() => transactionOrderer.insert(1)).to.throw(expectedException);
      expect(() => transactionOrderer.insert(transactionsFixtures[0])).to.throw(expectedException);
    });
    it('should be able to handle transaction insertion', function () {
      const insertion1 = transactionOrderer.insert(tx0);
      expect(insertion1).to.equal(true);
      expect(transactionOrderer.transactions.length).to.equal(1);
      expect(transactionOrderer.transactionIds.length).to.equal(1);
      expect(transactionOrderer.transactions[0]).to.equal(tx0);
      expect(transactionOrderer.transactionIds[0]).to.equal(tx0.hash);

      const insertion2 = transactionOrderer.insert(tx1)
      expect(insertion2).to.equal(true);
      expect(transactionOrderer.transactions[0]).to.equal(tx0);
      expect(transactionOrderer.transactionIds[0]).to.equal(tx0.hash);
      expect(transactionOrderer.transactions[1]).to.equal(tx1);
      expect(transactionOrderer.transactionIds[1]).to.equal(tx1.hash);
    });
    it('should not add twice', function () {
      const res = transactionOrderer.insert(tx1);
      expect(res).to.equal(false);
      expect(transactionOrderer.transactions.length).to.equal(2);
      expect(transactionOrderer.transactions[0]).to.equal(tx0);
      expect(transactionOrderer.transactions[1]).to.equal(tx1);
    });
  });
  describe.skip('.lookup', ()=>{
    it('should be able to lookup from hash', function () {
      const tx = transactionOrderer.lookupByTransactionHash(tx0.hash);
      expect(tx).to.deep.equal({tx:tx0, pos:0});

      const notFound = transactionOrderer.lookupByTransactionHash(tx41.hash);
      expect(notFound).to.deep.equal(null);
    });
  });
  describe.skip('.insertion predecessors', ()=> {
    // TODO: multiples inputs tests and ordered verifications.
    it('should lookup inputs predecessors', function () {
      const res1 = transactionOrderer.lookupInputsPredecessors(tx23);
      expect(res1).to.deep.equal([]);

      const res2 = transactionOrderer.lookupInputsPredecessors(tx1);
      expect(res2.length).to.equal(1);
      expect(res2).to.deep.equal([{tx: tx0, pos: 0}]);
    });
  });
  describe.skip('.reset', ()=>{
    it('should reset', function () {
      transactionOrderer.reset();
      expect(transactionOrderer.transactions.length).to.equal(0);
      expect(transactionOrderer.transactionIds.length).to.equal(0);
    });
  });
  describe.skip('.insertion successors', ()=>{
    // Todo: with more
    it('should lookup txid successors', function () {
      transactionOrderer.transactions = [tx1];
      const res = transactionOrderer.lookupTxIdSuccessors(tx0.hash);
      expect(res.length).to.equal(1);
      expect(res[0]).to.deep.equal({tx:tx1, pos:0});
    });
  });
  describe('.insertion full-case', ()=>{
    it('should insert after a predecessor', function () {
      transactionOrderer.reset();
      transactionOrderer.insert(tx0);
      transactionOrderer.insert(tx2);
      expect(transactionOrderer.transactions[0].hash).to.equal(tx0.hash);
      expect(transactionOrderer.transactions[1].hash).to.equal(tx2.hash);
      transactionOrderer.insert(tx1);
      expect(transactionOrderer.transactions[0].hash).to.equal(tx0.hash);
      expect(transactionOrderer.transactions[1].hash).to.equal(tx1.hash);
      expect(transactionOrderer.transactions[2].hash).to.equal(tx2.hash);

      // transactionOrderer.insert(tx22);
      // transactionOrderer.insert(tx21);

    });
    return;

    it('should insert before a successor', function () {
      transactionOrderer.reset();
      transactionOrderer.insert(tx0);
      transactionOrderer.insert(tx3);
      transactionOrderer.insert(tx22);
      expect(transactionOrderer.transactions[0].hash).to.equal(tx0.hash);
      expect(transactionOrderer.transactions[1].hash).to.equal(tx3.hash);
      expect(transactionOrderer.transactions[2].hash).to.equal(tx22.hash);

      // Add predecessor of tx3
      transactionOrderer.insert(tx2);
      expect(transactionOrderer.transactions[0].hash).to.equal(tx0.hash);
      expect(transactionOrderer.transactions[1].hash).to.equal(tx2.hash);
      expect(transactionOrderer.transactions[2].hash).to.equal(tx3.hash);
      expect(transactionOrderer.transactions[3].hash).to.equal(tx22.hash);
    });
    it('should insert between predecessor and sucessor', function () {
      transactionOrderer.reset();
      transactionOrderer.insert(tx0);
      transactionOrderer.insert(tx21);
      transactionOrderer.insert(tx1);

      expect(transactionOrderer.transactions[0].hash).to.equal(tx0.hash);
      expect(transactionOrderer.transactions[1].hash).to.equal(tx1.hash);
      expect(transactionOrderer.transactions[2].hash).to.equal(tx21.hash);
    });
    it('should extract and replace', function () {
     transactionOrderer.reset();
      transactionOrderer.insert(tx21);
      transactionOrderer.insert(tx0);
      transactionOrderer.insert(tx1);

      expect(transactionOrderer.transactions[0].hash).to.equal(tx0.hash);
      expect(transactionOrderer.transactions[1].hash).to.equal(tx1.hash);
      expect(transactionOrderer.transactions[2].hash).to.equal(tx21.hash);
    });
    it('should order correctly', function () {
      transactionOrderer.insert(tx23);
      transactionOrderer.insert(tx41);
      transactionOrderer.insert(tx1);
      transactionOrderer.insert(tx0);
      transactionOrderer.insert(tx21);
      transactionOrderer.insert(tx3);
      transactionOrderer.insert(tx22);
      transactionOrderer.insert(tx4);
      expect(transactionOrderer.transactions[0].hash).to.equal(tx0.hash);
      expect(transactionOrderer.transactions[1].hash).to.equal(tx1.hash);
      expect(transactionOrderer.transactions[2].hash).to.equal(tx21.hash);
      expect(transactionOrderer.transactions[3].hash).to.equal(tx41.hash);
      expect(transactionOrderer.transactions[4].hash).to.equal(tx22.hash);
      expect(transactionOrderer.transactions[5].hash).to.equal(tx23.hash);
      expect(transactionOrderer.transactions[6].hash).to.equal(tx3.hash);
      expect(transactionOrderer.transactions.length).to.equal(7);
      transactionOrderer.reset();
    });
  })
});
