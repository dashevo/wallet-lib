const DashPlatformProtocol = require('@dashevo/dpp');
const StandardPlugin = require('./StandardPlugin');

class DAP extends StandardPlugin {
  constructor(opts) {
    super(Object.assign({type: 'DAP'}, opts));
    this.schema = (opts.schema) ? opts.schema : null;
    this.isValid = false;
  }

  initDPP() {
    const dpp = new DashPlatformProtocol();
    const dapName = this.name.toLowerCase();
    const {schema} = this;
    if (!schema) {
      throw new Error('Missing DAP Schema. Cannot init DPP');
    }
    const contract = dpp.contract.create(dapName, schema);
    if (!dpp.contract.validate(contract)
        .isValid()) {
      throw new Error('Invalid DAP Contract');
    }
    dpp.setContract(contract);
    this.dpp = dpp;
  }

  async verifyDAP(transporter) {
    if (!this.schema) {
      throw new Error('Missing DAP Schema. Cannot verify');
    }
    if (!this.dpp) {
      this.initDPP();
    }
    const contractId = this.dpp.getContract().getId();
    console.log('Verifying DAP ID', contractId);

    if (!transporter || !transporter.fetchContract) {
      throw new Error('Require transporter to have a fetchContract method to verify DAP Contract');
    }
    try {
      await transporter.fetchContract(contractId);
      this.isValid = true;
      return this.isValid;
    } catch (e) {
      const isContractNotFoundError = new RegExp('Contract.*not.*found.*', 'g');
      if (isContractNotFoundError.test(e.message)) {
        throw new Error('Contract not present on the network. Did you `register`-ed it ? ');
      } else {
        throw e;
      }
    }
  }
  register(){
    console.log('Register a DAP');
  }
}

module.exports = DAP;
