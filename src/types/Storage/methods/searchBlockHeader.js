const { is } = require('../../../utils');
/**
 * Search a specific blockheader in the store
 * @param identifier - block hash or height
 * @return {{txid: *, found: boolean}}
 */
const searchBlockHeader = function (identifier) {
  const store = this.getStore();
  const search = {
    identifier,
    found: false,
  };
  const chainStore = store.chains[this.network.toString()];
  const blockheader = (is.num(identifier)
  // eslint-disable-next-line no-underscore-dangle
    ? chainStore.blockHeaders[chainStore.mappedBlockHeaderHeights[identifier]]
    : chainStore.blockHeaders[identifier]);

  if (blockheader) {
    search.found = true;
    search.result = blockheader;
  }
  return search;
};
module.exports = searchBlockHeader;
