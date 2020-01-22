const _ = require('lodash');
/**
 * Search an address having a specific txid
 * todo : Handle when multiples one (inbound/outbound)
 * @param txid
 * @return {{found: boolean, txid: *, results: []}}
 */
const searchAddressesWithTx = function (txid) {
  const search = {
    txid,
    results: [],
    found: false,
  };
  const store = this.getStore();

  // Look up by looping over all addresses todo:optimisation
  const existingWallets = Object.keys(store.wallets);
  existingWallets.forEach((walletId) => {
    if (_.has(store.wallets[walletId], 'addresses')) {
      const existingTypes = Object.keys(store.wallets[walletId].addresses);
      existingTypes.forEach((type) => {
        const existingPaths = Object.keys(store.wallets[walletId].addresses[type]);
        existingPaths.forEach((path) => {
          const el = store.wallets[walletId].addresses[type][path];
          if (el.transactions.includes(search.txid)) {
            search.results.push({ type, ...el });
            search.found = true;
          }
        });
      });
    }
  });

  return search;
};
module.exports = searchAddressesWithTx;
