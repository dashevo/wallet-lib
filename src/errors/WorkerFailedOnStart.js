const WalletLibError = require('./WalletLibError');

class WorkerFailedOnStart extends WalletLibError {
  constructor(pluginName, reason = 'unknown', err) {
    let message = `Worker ${pluginName} failed onStart. Reason: ${reason}`;
    if(err && err.stack){
      message += err.stack;
    }
    super(message);
  }
}

module.exports = WorkerFailedOnStart;
