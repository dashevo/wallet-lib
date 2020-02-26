const DAPIClient = require('@dashevo/dapi-client');
const logger = require('../logger');
const { is, hasProp } = require('../utils/index');
// const { Transaction } = require('@dashevo/dashcore-lib');
const transportList = {
  dapi: DAPIClient,
};

function isValidTransport(transport) {
  if (is.string(transport)) {
    return hasProp(transportList, transport);
  }
  if (is.obj(transport)) {
    let valid = true;
    const expectedKeys = [
      'getAddressSummary',
      'getTransaction',
      'getUTXO',
      'sendTransaction',
    ];
    expectedKeys.forEach((key) => {
      if (!transport[key]) {
        valid = false;
        logger.error(`Invalid Transporter. Expected key :${key}`);
      }
    });
    return valid;
  }
  return false;
}

class Transporter {
  constructor(transportArg) {
    this.isValid = false;
    this.canConnect = true;
    this.type = null;
    this.transport = null;

    if (is.undef(transportArg)) {
      // eslint-disable-next-line no-param-reassign
      transportArg = 'dapi';
    }
    if (transportArg) {
      let transport = transportArg;
      if (is.string(transportArg)) {
        const loweredTransportName = transportArg.toString().toLowerCase();
        if (Object.keys(transportList).includes(loweredTransportName)) {
          // TODO : Remove me toward release
          if (transportArg === 'dapi') {
            transport = new DAPIClient({
              seeds: [{ service: '18.236.131.253:3000' }],
              timeout: 20000,
              retries: 5,
            });
          } else {
            transport = new transportList[loweredTransportName]();
          }
          this.isValid = isValidTransport(transport);
        }
      } else {
        this.isValid = isValidTransport(transportArg);
      }
      this.type = transporter.type || transporter.constructor.name;
      this.transport = transport;
    }
  }
};

// Transporter.prototype.disconnect = require('./methods/disconnect');
// Transporter.prototype.fetchAndReturn = require('./methods/fetchAndReturn');
// Transporter.prototype.getAddressSummary = require('./methods/getAddressSummary');
// Transporter.prototype.getBestBlockHeight = require('./methods/getBestBlockHeight');
// Transporter.prototype.getNetwork = require('./methods/getNetwork');
// Transporter.prototype.getStatus = require('./methods/getStatus');
// Transporter.prototype.getTransaction = require('./methods/getTransaction');
// Transporter.prototype.getUTXO = require('./methods/getUTXO');
// Transporter.prototype.handleErrors = require('./methods/handleErrors');
// Transporter.prototype.hasSupportFor = require('./methods/hasSupportFor');
// Transporter.prototype.sendTransaction = require('./methods/sendTransaction');
// Transporter.prototype.subscribeToAddresses = require('./methods/subscribeToAddresses');
// Transporter.prototype.subscribeToBlocks = require('./methods/subscribeToBlocks');
// Transporter.prototype.subscribeToEvent = require('./methods/subscribeToEvent');
// Transporter.prototype.fetchAndReturn = require('./methods/fetchAndReturn');
// Transporter.prototype.sendTransaction = require('./methods/sendTransaction');
module.exports = Transporter;
