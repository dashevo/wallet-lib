const { WALLET_TYPES } = require('../../../../CONSTANTS');

/**
 * Set last synced block hash
 *
 * @param  {string} hash
 * @return {string}
 */
module.exports = function setLastSyncedBlockHash(hash) {
  const { walletId } = this;
  const accountsStore = this.storage.store.wallets[walletId].accounts;

  const accountStore = (this.walletType === WALLET_TYPES.SINGLE_ADDRESS)
    ? accountsStore[this.index.toString()]
    : accountsStore[this.BIP44PATH.toString()];

  accountStore.blockHash = hash;

  this.storage.store.lastModified = +new Date();
  return accountStore.blockHash;
};
