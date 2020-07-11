const { WALLET_TYPES } = require('../../../../CONSTANTS');
/**
 * Return last synced block height
 * @return {number}
 */
module.exports = function getLastSyncedBlockHeight() {
  const { walletId } = this;
  const accountsStore = this.storage.store.wallets[walletId].accounts;

  const { blockHeight } = (this.walletType === WALLET_TYPES.SINGLE_ADDRESS)
    ? accountsStore[this.index.toString()]
    : accountsStore[this.BIP44PATH.toString()];

  return blockHeight;
};
