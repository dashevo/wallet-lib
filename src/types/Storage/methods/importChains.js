/**
 * Import chains to the store
 *
 * @param {object} chains
 * @return {void}
 */
const importChains = function (chains) {
  Object.assign(this.store.chains, chains);
};
module.exports = importChains;
