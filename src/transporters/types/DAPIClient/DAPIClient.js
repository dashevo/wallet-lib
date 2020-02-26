const BaseTransporter = require('../BaseTransporter/BaseTransporter');
const logger = require('../../../logger');

class DAPIClient extends BaseTransporter {
  constructor(props) {
    super({ ...props, type: 'DAPIClient' });
    try {
      // This allows to not have dapi-client shipped by default.
      // eslint-disable-next-line global-require
      const Client = require('@dashevo/dapi-client');
      this.client = new Client(props);
    } catch (err) {
      logger.error("The '@dashevo/dapi-client' package is missing! Please install it with 'npm install @dashevo/dapi-client --save' command.");
    }
  }
}

DAPIClient.prototype.getAddressSummary = require('./methods/getAddressSummary');
DAPIClient.prototype.getBlockByHash = require('./methods/getBlockByHash');
DAPIClient.prototype.getBlockHeaderByHash = require('./methods/getBlockHeaderByHash');
DAPIClient.prototype.getBlockByHeight = require('./methods/getBlockByHeight');
DAPIClient.prototype.getBestBlockHash = require('./methods/getBestBlockHash');
DAPIClient.prototype.getStatus = require('./methods/getStatus');
DAPIClient.prototype.getTransaction = require('./methods/getTransaction');
DAPIClient.prototype.getUTXO = require('./methods/getUTXO');
DAPIClient.prototype.sendTransaction = require('./methods/sendTransaction');
DAPIClient.prototype.subscribeToAddressesTransactions = require('./methods/subscribeToAddressesTransactions');
DAPIClient.prototype.subscribeToBlockHeaders = require('./methods/subscribeToBlockHeaders');
DAPIClient.prototype.subscribeToBlocks = require('./methods/subscribeToBlocks');

module.exports = DAPIClient;
