const { is } = require('../utils/index');

function isValidTransport(transport) {
  return !!(transport);
}

const transportList = {
  Insight: require('../transports/Insight/insightClient'),
  DAPIClient: require('../transports/DAPI/DapiClient'),
};

class Transporter {
  constructor(transportArg) {
    this.valid = isValidTransport(transportArg);

    let transport = transportArg;
    if (is.string(transportArg) && Object.keys(transportList).includes(transportArg)) {
      transport = transportList[transportArg];
    }
    this.type = transport.type || transport.constructor.name;
    if (!this.valid) throw new Error(`Invalid transport of type ${this.type}`);
    this.transport = transport;
  }

  async getAddressSummary(address) {
    if (!is.address(address)) throw new Error('Received an invalid address to fetch');
    const data = await this.transport.getAddressSummary(address).catch((err) => {
      throw new Error(err);
    });
    return data;
  }

  async getTransaction(txid) {
    if (!is.transactionId(txid)) throw new Error('Received an invalid txid to fetch');
    const data = await this.transport.getTransaction(txid).catch((err) => {
      throw new Error(err);
    });
    return data;
  }

  async getUTXO(address) {
    if (!is.address(address)) throw new Error('Received an invalid address to fetch');
    const data = await this.transport.getUTXO(address).catch((err) => {
      throw new Error(err);
    });
    return data;
  }
}
module.exports = Transporter;
