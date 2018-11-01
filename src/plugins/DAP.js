const StandardPlugin = require('./StandardPlugin');

class DAP extends StandardPlugin {
  constructor(){
    super('DAP')
  }
  verifyDAP(){
    //TODO: Schema validation ?
    //TODO : Verify if DAP is reachable via DAPI ?
  }
};
module.exports = DAP;