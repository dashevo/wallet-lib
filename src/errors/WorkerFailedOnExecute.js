const WalletLibError = require('./WalletLibError');

class WorkerFailedOnExecute extends WalletLibError {
  constructor(pluginName, reason = 'unknown', err) {
    let message = `Worker ${pluginName} failed onExecute. Reason: ${reason}`;
    if(err && err.stack){
      message += err.stack;
    }
    super(message);
  }
}

module.exports = WorkerFailedOnExecute;
