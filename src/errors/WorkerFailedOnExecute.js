const WalletLibError = require('./WalletLibError');

class WorkerFailedOnExecute extends WalletLibError {
  constructor(pluginName, reason = 'unknown') {
    let message = `Worker ${pluginName} failed onExecute. Reason: ${reason}`;
    super(message);
  }
}

module.exports = WorkerFailedOnExecute;
