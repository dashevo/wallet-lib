const { expect } = require('chai');
const SyncWorker = require('../../src/plugins/SyncWorker');


describe('Adapter - inMem', () => {
  it('should work', () => {
    const worker = new SyncWorker();
    const now = Date.now();
    const expectedFetchthreeshold = now - (10 * 60 * 1000);
    expect(worker.fetchThreeshold).to.below(expectedFetchthreeshold + 100);
    expect(worker.fetchThreeshold).to.above(expectedFetchthreeshold - 100);
    worker.stopWorker();
  });
});
