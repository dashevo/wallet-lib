const { cloneDeep } = require('lodash');
const initialStore = require('../initialStore');
/**
 * Clear all the store and save the cleared store to the persistance adapter
 * @return {Promise<boolean>}
 */
async function clearAll() {
  this.store = cloneDeep(initialStore);
  return this.saveState();
}

module.exports = clearAll;
