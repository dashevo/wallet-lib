const { WALLET_TYPES } = require('../../../../CONSTANTS');

/**
 * Set last synced block height
 *
 * @param  {number} blockHeight
 * @return {number}
 */
module.exports = function setLastSyncedBlockHeight(blockHeight) {
  const { walletId, transport } = this;
  const accountsStore = this.storage.store.wallets[walletId].accounts;

  const accountStore = (this.walletType === WALLET_TYPES.SINGLE_ADDRESS)
      ? accountsStore[this.index.toString()]
      : accountsStore[this.BIP44PATH.toString()];

  accountStore.blockHeight = blockHeight;

  transport.client.core.getBlockHash(blockHeight).then((hash) => {
    accountStore.blockHash = hash;
  });

  return accountStore.blockHeight;
};
