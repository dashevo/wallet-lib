const blocksData = require('./data/blocks/blocks.js');
const BaseTransporter = require('../../src/transporters/types/BaseTransporter/BaseTransporter');

// const bestBlockDataHeight = 3812;
const bestBlockDataHeight = 21546;
/**
 * This is a saved snapshot of some selected blocks and transactions
 * Meant to be used as replacement of DAPIClient.
 * Read more on the specificities on Readme.md and the things that are saved
 *
 */
class FakeDevnet extends BaseTransporter {
  constructor(props) {
    super({ ...props, type: 'DAPIClient' });
    // By default,
    this.height = bestBlockDataHeight;
    this.blockHash = blocksData.heights[this.height];

    this.relayFee = 0.00001;
    this.difficulty = 0.00171976818884149;
    this.network = 'testnet';
  }

  setHeight(height) {
    if (!height) throw new Error('Height needed');
    this.height = height;
    console.log(blocksData.heights)
    if (!blocksData.heights[this.height]) {
      throw new Error(`Missing block ${this.height}`);
    }
    this.blockHash = blocksData.heights[this.height];
  }

  rewindBlock(step = 1) {
    this.height -= step;
    if (!blocksData.heights[this.height]) {
      throw new Error(`Missing block ${this.height}`);
    }
    this.blockHash = blocksData.heights[this.height];
  }

  forwardBlock(step = 1) {
    this.height += step;
    if (!blocksData.heights[this.height]) {
      throw new Error(`Missing block ${this.height}`);
    }
    this.blockHash = blocksData.heights[this.height];
  }

  getMnemonicList() {
    return [
      'nerve iron scrap chronic error wild glue sound range hurdle alter dwarf',
    ];
  }
}

// FakeDevnet.prototype.getAddressSummary = require('./methods/getAddressSummary');
FakeDevnet.prototype.getBestBlock = require('./methods/getBestBlock');
FakeDevnet.prototype.getBestBlockHash = require('./methods/getBestBlockHash');
FakeDevnet.prototype.getBestBlockHeader = require('./methods/getBestBlockHeader');
FakeDevnet.prototype.getBestBlockHeight = require('./methods/getBestBlockHeight');
FakeDevnet.prototype.getBlockByHash = require('./methods/getBlockByHash');
FakeDevnet.prototype.getBlockByHeight = require('./methods/getBlockByHeight');
FakeDevnet.prototype.getBlockHeaderByHash = require('./methods/getBlockHeaderByHash');
FakeDevnet.prototype.getBlockHeaderByHeight = require('./methods/getBlockHeaderByHeight');
FakeDevnet.prototype.getStatus = require('./methods/getStatus');
FakeDevnet.prototype.getAddressSummary = require('./methods/getAddressSummary');
FakeDevnet.prototype.getTransaction = require('./methods/getTransaction');
FakeDevnet.prototype.getUTXO = require('./methods/getUTXO');
FakeDevnet.prototype.sendTransaction = require('./methods/sendTransaction');
FakeDevnet.prototype.subscribeToAddressesTransactions = require('./methods/subscribeToAddressesTransactions');
FakeDevnet.prototype.subscribeToBlockHeaders = require('./methods/subscribeToBlockHeaders');
FakeDevnet.prototype.subscribeToBlocks = require('./methods/subscribeToBlocks');
module.exports = FakeDevnet;
