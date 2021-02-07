const logger = require('../../logger');
const { StandardPlugin } = require('..');
const EVENTS = require('../../EVENTS');

const defaultOpts = {
  firstExecutionRequired: true,
  executeOnStart: true,
};

class ChainPlugin extends StandardPlugin {
  constructor(opts = {}) {
    const params = {
      name: 'ChainPlugin',
      executeOnStart: defaultOpts.executeOnStart,
      firstExecutionRequired: defaultOpts.firstExecutionRequired,
      dependencies: [
        'storage',
        'transport',
        'fetchStatus',
        'walletId',
      ],
    };
    super(Object.assign(params, opts));
    this.isSubscribedToBlocks = false;
  }

  /**
   * Used to subscribe to blockheaders and provide BLOCK, BLOCKHEADER and BLOCKHEIGHT_CHANGED.
   * Also, maintain the blockheader storage up to date.
   * @return {Promise<void>}
   */
  async execBlockListener() {
    const self = this;
    const { network } = this.storage.store.wallets[this.walletId];

    if (!this.isSubscribedToBlocks) {
      self.transport.on(EVENTS.BLOCK, async (ev) => {
        // const { network } = self.storage.store.wallets[self.walletId];
        const { payload: block } = ev;
        this.parentEvents.emit(EVENTS.BLOCK, { type: EVENTS.BLOCK, payload: block });
        // We do not announce BLOCKHEADER as this is done by Storage
        await self.storage.importBlockHeader(block.header);

        const blockHeight = await self.transport.getBestBlockHeight();
        this.storage.store.chains[network.toString()].blockHeight = blockHeight;
        logger.debug(`ChainPlugin - setting chain blockheight ${blockHeight}`);
      });
      await self.transport.subscribeToBlocks();
    }
  }

  /**
   * Used on ChainPlugin to be able to report on BLOCKHEIGHT_CHANGED.
   * Neither Block or Blockheader contains blockheight, we need to fetch it from getStatus.blocks
   * @return {Promise<boolean|*>}
   */
  async execStatusFetch() {
    const res = await this.fetchStatus();
    if (!res) {
      return false;
    }
    const { blocks } = res;
    logger.debug('ChainPlugin - Setting up starting blockHeight', blocks);

    const height = blocks;
    const bestBlock = await this.transport.getBlockHeaderByHeight(height);
    await this.storage.importBlockHeader(bestBlock, height);

    return true;
  }

  async onStart() {
    await this.execStatusFetch();
    await this.execBlockListener();
  }
}

module.exports = ChainPlugin;
