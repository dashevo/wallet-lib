const { is } = require('../utils');

function isValidTransport(transport) {
  return !!(transport);
}

class Transporter {
  constructor(transport) {
    this.valid = isValidTransport(transport);
    this.type = transport.type || transport.constructor.name;
    if (!this.valid) throw new Error(`Invalid transport of type ${this.type}`);
    this.transport = transport;
  }

  async getAddressSummary(address) {
    if (!is.address(address)) throw new Error('Received an invalid address to fetch');
    const data = await this.transport.getAddressSummary(address);
    return data;
  }

  async getUTXO(address) {
    if (!is.address(address)) throw new Error('Received an invalid address to fetch');
    const data = await this.transport.getUTXO(address);
    return data;
  }
}
module.exports = Transporter;
