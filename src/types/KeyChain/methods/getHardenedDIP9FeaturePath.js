const { DIP9_LIVENET_ROOT_PATH, DIP9_TESTNET_ROOT_PATH } = require('../../../CONSTANTS');

/**
 * Return a safier root path to derivate from
 *
 */
function getHardenedDIP9FeaturePath() {
  const pathRoot = (this.network.toString() === 'testnet') ? DIP9_TESTNET_ROOT_PATH : DIP9_LIVENET_ROOT_PATH;
  return this.generateKeyForPath(pathRoot);
}
module.exports = getHardenedDIP9FeaturePath;
