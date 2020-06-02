const BaseTransporter = require('../BaseTransporter/BaseTransporter');
const logger = require('../../../logger');

class DAPIClientWrapper extends BaseTransporter {
  constructor(props) {
    super({ ...props, type: 'DAPIClientWrapper' });
    try {
      // This allows to not have dapi-client shipped by default.
      // eslint-disable-next-line global-require,import/no-extraneous-dependencies
      const Client = require('@dashevo/dapi-client');
      this.client = new Client(props);
    } catch (err) {
      logger.error("The '@dashevo/dapi-client' package is missing! Please install it with 'npm install @dashevo/dapi-client --save' command.");
    }
  }
}

DAPIClientWrapper.prototype.disconnect = require('./methods/disconnect');
DAPIClientWrapper.prototype.getAddressSummary = require('./methods/getAddressSummary');
DAPIClientWrapper.prototype.getBestBlock = require('./methods/getBestBlock');
DAPIClientWrapper.prototype.getBestBlockHeader = require('./methods/getBestBlockHeader');
DAPIClientWrapper.prototype.getBestBlockHash = require('./methods/getBestBlockHash');
DAPIClientWrapper.prototype.getBestBlockHeight = require('./methods/getBestBlockHeight');
DAPIClientWrapper.prototype.getBlockHash = require('./methods/getBlockHash');
DAPIClientWrapper.prototype.getBlockByHash = require('./methods/getBlockByHash');
DAPIClientWrapper.prototype.getBlockByHeight = require('./methods/getBlockByHeight');
DAPIClientWrapper.prototype.getBlockHeaderByHash = require('./methods/getBlockHeaderByHash');
DAPIClientWrapper.prototype.getBlockHeaderByHeight = require('./methods/getBlockHeaderByHeight');
DAPIClientWrapper.prototype.getStatus = require('./methods/getStatus');
DAPIClientWrapper.prototype.getTransaction = require('./methods/getTransaction');
DAPIClientWrapper.prototype.getUTXO = require('./methods/getUTXO');
DAPIClientWrapper.prototype.sendTransaction = require('./methods/sendTransaction');
DAPIClientWrapper.prototype.subscribeToAddressesTransactions = require('./methods/subscribeToAddressesTransactions');
DAPIClientWrapper.prototype.subscribeToBlockHeaders = require('./methods/subscribeToBlockHeaders');
DAPIClientWrapper.prototype.subscribeToBlocks = require('./methods/subscribeToBlocks');

module.exports = DAPIClientWrapper;
