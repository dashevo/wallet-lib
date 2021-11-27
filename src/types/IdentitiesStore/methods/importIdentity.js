const IdentityReplaceError = require('../../../errors/IndentityIdReplaceError');

/**
 *
 * @param {string} walletId
 * @param {number} identityIndex
 * @param {string} identityId
 * @return void
 */
function importIdentity(walletId, identityIndex, identityId) {
  console.log(walletId, identityIndex, identityId);
  if (!this.store.wallets[walletId].identityIds) {
    this.store.wallets[walletId].identityIds = [];
  }

  const existingId = this.getIdentityIdByIndex(walletId, identityIndex);

  if (Boolean(existingId) && existingId !== identityId) {
    throw new IdentityReplaceError(`Trying to replace identity at index ${identityIndex}`);
  }

  this.store.wallets[walletId].identityIds[identityIndex] = identityId;
  this.lastModified = Date.now();
}

module.exports = importIdentity;
