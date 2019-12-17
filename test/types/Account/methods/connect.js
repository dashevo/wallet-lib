const { expect } = require('chai');
const connect = require('../../../../src/types/Account/methods/connect');
const Worker = require('../../../../src/plugins/Worker');

class DummyWorker extends Worker {
  constructor() {
    super({
      name: 'DummyWorker',
      dependencies: [],
    });
  }

  // eslint-disable-next-line class-methods-use-this
  execute() {
    console.log('Dummy worker successfully did nothing');
  }
}

const emitted = [];

describe('Account - connect', () => {
  it('should connect to stream and worker', () => {
    const self = {
      events: {
        emit: (eventName) => emitted.push(eventName),
      },
      transport: {
        isValid: true,
        connect: () => true,
      },
      plugins: {
        workers: {
          dummyWorker: new DummyWorker(),
        },
      },
    };

    // We simulate what injectPlugin does regarding events
    self.plugins.workers.dummyWorker.events = self.events;

    expect(connect.call(self)).to.equal(true);
    expect(emitted).to.deep.equal(['WORKER/DUMMYWORKER/STARTED']);

    // We need to stop the worker
    self.plugins.workers.dummyWorker.stopWorker();
  });
});
