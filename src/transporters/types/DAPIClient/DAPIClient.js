const BaseTransporter = require('../BaseTransporter/BaseTransporter');
const logger = require('../../../logger');
const { getSeeds } = require('../../../utils/dns');

class DAPIClient extends BaseTransporter {
  constructor(props) {
    super({ ...props, type: 'DAPIClient' });
    try {
      // This allows to not have dapi-client shipped by default.
      // eslint-disable-next-line global-require,import/no-extraneous-dependencies
      const Client = require('@dashevo/dapi-client');
      this.state.isReady = false;

      const self = this;
      (async () => {
        const seeds = (props.seeds)
          ? props.seeds
          : await getSeeds(props.devnetName, props.noLookup);
        self.state.isReady = true;
        self.client = new Client(Object.assign(props, { seeds }));
      })();
    } catch (err) {
      logger.error("The '@dashevo/dapi-client' package is missing! Please install it with 'npm install @dashevo/dapi-client --save' command.");
    }
  }

  isReady() {
    return new Promise(((resolve) => {
      if (this.state.isReady) return resolve(true);
      const interval = setInterval(() => {
        if (this.state.isReady) {
          clearInterval(interval);
          resolve(true);
        }
      }, 50);
      return interval;
    }));
  }
}

DAPIClient.prototype.disconnect = require('./methods/disconnect');
DAPIClient.prototype.getAddressSummary = require('./methods/getAddressSummary');
DAPIClient.prototype.getBestBlock = require('./methods/getBestBlock');
DAPIClient.prototype.getBestBlockHeader = require('./methods/getBestBlockHeader');
DAPIClient.prototype.getBestBlockHash = require('./methods/getBestBlockHash');
DAPIClient.prototype.getBestBlockHeight = require('./methods/getBestBlockHeight');
DAPIClient.prototype.getBlockHash = require('./methods/getBlockHash');
DAPIClient.prototype.getBlockByHash = require('./methods/getBlockByHash');
DAPIClient.prototype.getBlockByHeight = require('./methods/getBlockByHeight');
DAPIClient.prototype.getBlockHeaderByHash = require('./methods/getBlockHeaderByHash');
DAPIClient.prototype.getBlockHeaderByHeight = require('./methods/getBlockHeaderByHeight');
DAPIClient.prototype.getStatus = require('./methods/getStatus');
DAPIClient.prototype.getTransaction = require('./methods/getTransaction');
DAPIClient.prototype.getUTXO = require('./methods/getUTXO');
DAPIClient.prototype.sendTransaction = require('./methods/sendTransaction');
DAPIClient.prototype.subscribeToAddressesTransactions = require('./methods/subscribeToAddressesTransactions');
DAPIClient.prototype.subscribeToBlockHeaders = require('./methods/subscribeToBlockHeaders');
DAPIClient.prototype.subscribeToBlocks = require('./methods/subscribeToBlocks');

module.exports = DAPIClient;
