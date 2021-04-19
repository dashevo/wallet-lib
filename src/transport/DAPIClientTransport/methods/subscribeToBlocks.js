const EVENTS = require('../../../EVENTS');

/**
 *
 * @param  {number} refreshBlockInterval - refresh rate in ms
 * @returns {Promise<void>}
 */
module.exports = async function subscribeToBlocks(refreshBlockInterval = 30 * 1000) {
  const self = this;
  const { executors } = this.state;
  let failedRequest = 0;

  const executor = async () => {
    const chainHash = await this.getBestBlockHash();

    if (!self.state.block || self.state.block.hash !== chainHash) {
      self.state.block = await self.getBlockByHash(await this.getBestBlockHash());
      self.announce(EVENTS.BLOCK, self.state.block);
    }
  };

  const tryExecutor = async () => {
    try {
      await executor();
      failedRequest = 0;
    } catch (e) {
      failedRequest += 1;
      console.error(e);
      if (failedRequest < 2) {
        await tryExecutor();
      }
    }
  };

  executors.blocks = setInterval(async () => {
    await tryExecutor();
  }, refreshBlockInterval);

  await tryExecutor();
};
