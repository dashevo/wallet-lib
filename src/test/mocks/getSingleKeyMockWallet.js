const getSingleKeyMockStore = require('./getSingleKeyMockStore');

function getSingleKeyMockWallet() {
  const mock = {
    walletId: 'f03f3fa4b5',
    storage: {
      store: getSingleKeyMockStore(),
    },
    index: 0,
    walletType: 'single_address',
  };
  return mock;
}
module.exports = getSingleKeyMockWallet;
