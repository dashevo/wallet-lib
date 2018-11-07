const _ = require('lodash');
const StandardPlugin = require('./StandardPlugin');

const defaultOpts = {
  workerIntervalTime: 10 * 1000,
  executeOnStart: false,
  firstExecutionRequired: false,
};

class Worker extends StandardPlugin {
  constructor(opts = defaultOpts) {
    super(Object.assign({ type: 'Worker' }, opts));
    this.worker = null;
    this.workerPass = 0;
    this.isWorkerRunning = false;

    this.firstExecutionRequired = _.has(opts, 'firstExecutionRequired')
      ? opts.firstExecutionRequired
      : defaultOpts.firstExecutionRequired;

    this.executeOnStart = _.has(opts, 'executeOnStart')
      ? opts.executeOnStart
      : defaultOpts.executeOnStart;

    this.workerIntervalTime = (opts.workerIntervalTime)
      ? opts.workerIntervalTime
      : defaultOpts.workerIntervalTime;
  }

  startWorker() {
    const self = this;
    if (this.worker) this.stopWorker();
    // every minutes, check the pool
    this.worker = setInterval(this.execWorker.bind(self), this.workerIntervalTime);
    this.events.emit(`WORKER/${this.constructor.name.toUpperCase()}/STARTED`);
    if (this.execDuringStart) {
      this.execDuringStart();
    }
    if (this.executeOnStart === true) {
      this.execWorker();
    }
  }

  stopWorker() {
    clearInterval(this.worker);
    this.worker = null;
    this.workerPass = 0;
    this.isWorkerRunning = false;
    this.events.emit(`WORKER/${this.constructor.name.toUpperCase()}/STOPPED`);
  }

  async execWorker() {
    if (this.isWorkerRunning) {
      return false;
    }
    this.isWorkerRunning = true;

    if (this.execute) {
      await this.execute();
    } else {
      console.error(`${this.constructor.name} : Missing execute function`);
    }

    this.workerRunning = false;
    this.workerPass += 1;

    this.events.emit(`WORKER/${this.constructor.name.toUpperCase()}/EXECUTED`);
    return true;
  }
}
module.exports = Worker;