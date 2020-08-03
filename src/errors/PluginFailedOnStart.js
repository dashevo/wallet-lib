const WalletLibError = require('./WalletLibError');

class PluginFailedOnStart extends WalletLibError {
  constructor(pluginType, pluginName, reason = 'unknown', err) {
    super(`Plugin ${pluginName} of type ${pluginType} onStart failed. Reason: ${reason}`);
    if (err.stack) this.stack = err.stack;
  }
}

module.exports = PluginFailedOnStart;
