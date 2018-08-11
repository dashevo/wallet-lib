const { is } = require('../utils/index');
const InsightClient = require('../transports/Insight/insightClient');
const DAPIClient = require('../transports/DAPI/DapiClient');

function isValidTransport(transport) {
  return !!(transport);
}

const transportList = {
  Insight: InsightClient,
  DAPIClient,
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
    if (!is.txid(txid)) throw new Error(`Received an invalid txid to fetch : ${txid}`);
    const data = await this.transport.getTransaction(txid).catch((err) => {
      throw new Error(err);
    });
    if (data.confirmations) {
      delete data.confirmations;
    }
    return data;
  }

  async getUTXO(address) {
    if (!is.address(address)) throw new Error('Received an invalid address to fetch');
    const data = await this.transport.getUTXO(address).catch((err) => {
      throw new Error(err);
    });
    return data;
  }

  async subscribeToAddresses(addresses, cb) {
    if (addresses.length > 0) {
      // todo verify if valid addresses
      // if (!is.address(address)) throw new Error('Received an invalid address to fetch');
      return this.transport.subscribeToAddresses(addresses, cb);
    }
    return false;
  }

  disconnect() {
    return (this.transport.closeSocket) ? this.transport.closeSocket() : false;
  }

  async sendRawTransaction(rawtx, isIs) {
    if (!is.string(rawtx)) throw new Error('Received an invalid rawtx');
    return this.transport.sendRawTransaction(rawtx, isIs);
  }
}
module.exports = Transporter;
