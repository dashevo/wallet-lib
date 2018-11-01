const StandardPlugin = require('./StandardPlugin');

class DAP extends StandardPlugin {
  constructor() {
    super('DAP');
    this.isValid = false;
  }

  verifyDAP() {
    return this.isValid;
    // TODO: Schema validation ?
    // TODO : Verify if DAP is reachable via DAPI ?
  }
}
module.exports = DAP;
