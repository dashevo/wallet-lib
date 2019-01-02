const configureAdapter = require('./_configureAdapter.js');
const getDefaultAdapter = require('./_getDefaultAdapter.js');
const { CONFIGURED } = require('../EVENTS');

/**
 * To be called after instantialization as it contains all the async logic / test of adapters
 * @param opts
 * @return {Promise<void>}
 */
module.exports = async function configure(opts = {}) {
  this.rehydrate = (opts.rehydrate) ? opts.rehydrate : this.rehydrate;
  this.autosave = (opts.autosave) ? opts.autosave : this.autosave;
  this.adapter = await configureAdapter((opts.adapter) ? opts.adapter : await getDefaultAdapter());

  if (this.rehydrate) {
    await this.rehydrateState();
  }

  this.events.emit(CONFIGURED);
};