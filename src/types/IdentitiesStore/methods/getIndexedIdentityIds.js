/**
 *
 * @param {string} walletId
 * @return {Array<string|undefined>}
 */
function getIndexedIdentityIds(walletId) {
  return [...this.state.wallets[walletId].identities]
    .map((identity) => {

    });
  return [...this.state.wallets[walletId].identities];
}

module.exports = getIndexedIdentityIds;
