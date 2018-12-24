const { hasProp } = require('../utils');
const Dashcore = require('@dashevo/dashcore-lib');

const { testnet } = Dashcore.Networks;
const createWallet = function (walletId, network = testnet, mnemonic = null, type = null) {
  if (!hasProp(this.store.wallets, walletId)) {
    this.store.wallets[walletId] = {
      accounts: {},
      network,
      mnemonic,
      type,
      blockheight: 0,
      addresses: {
        external: {},
        internal: {},
        misc: {},
      },
    };
    this.createChain(network);
    return true;
  }
  return false;
};
module.exports = createWallet;
