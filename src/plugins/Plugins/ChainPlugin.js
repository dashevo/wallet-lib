const logger = require('../../logger');
const { StandardPlugin } = require('../');
const { ValidTransportLayerRequired } = require('../../errors');
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
        'transporter',
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

    // const currentHeight = (await this.fetchStatus()).blocks;

    if (!this.isSubscribedToBlocks) {
      self.transporter.on(EVENTS.BLOCK, async (ev) => {
        // const { network } = self.storage.store.wallets[self.walletId];
        const { payload: block } = ev;
        self.announce(EVENTS.BLOCK, block);
        self.announce(EVENTS.BLOCKHEADER, block.header);

        await self.storage.importBlockHeader(block.header);
        // self.announce(
        //   EVENTS.BLOCKHEIGHT_CHANGED,
        //   self.storage.store.chains[network.toString()].blockHeight,
        // );
      });
      await self.transporter.subscribeToBlocks();
    }
  }

  /**
   * Used on ChainPlugin to be able to report on BLOCKHEIGHT_CHANGED.
   * Neither Block or Blockheader contains blockheight, we need to fetch it from getStatus.blocks
   * @return {Promise<boolean|*>}
   */
  async execStatusFetch() {
    try {
      const res = await this.fetchStatus();
      if (!res) {
        return false;
      }
      const { blocks } = res;
      const { network } = this.storage.store.wallets[this.walletId];
      this.storage.store.chains[network.toString()].blockHeight = blocks;
      await this.storage.importBlockHeader(await this.transporter.getBlockHeaderByHash(await this.transporter.getBlockHash(blocks)));

// /**/      this.announce(EVENTS.BLOCKHEIGHT_CHANGED, blocks);
      return true;
    } catch (err) {
      if (err instanceof ValidTransportLayerRequired) {
        logger.error('Error', err);
      }
      return err;
    }
  }

  async onStart() {
    await this.execStatusFetch();
    await this.execBlockListener();
  }

  announce(type, el) {
    switch (type) {
      case EVENTS.BLOCK:
        this.parentEvents.emit(EVENTS.BLOCK, { type: EVENTS.BLOCK, payload: el });
        break;
      case EVENTS.BLOCKHEADER:
        this.parentEvents.emit(EVENTS.BLOCKHEADER, { type: EVENTS.BLOCKHEADER, payload: el });
        break;
      case EVENTS.BLOCKHEIGHT_CHANGED:
        this.parentEvents.emit(EVENTS.BLOCKHEIGHT_CHANGED,
          { type: EVENTS.BLOCKHEIGHT_CHANGED, payload: el });
        break;
      default:
        this.parentEvents.emit(type, { type, payload: el });
        logger.warn('ChainPlugin - Not implemented, announce of ', type, el);
    }
  }
}

module.exports = ChainPlugin;
