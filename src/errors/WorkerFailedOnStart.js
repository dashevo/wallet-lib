const WalletLibError = require('./WalletLibError');

class WorkerFailedOnStart extends WalletLibError {
  constructor(pluginName, reason = 'unknown', err) {
    const message = `Worker ${pluginName} failed onStart. Reason: ${reason}`;
    super(message);
    if (err.stack) this.stack = err.stack;
  }
}

module.exports = WorkerFailedOnStart;
