/**
 * Add a new transaction to an address (push a tx)
* @param tx
* @return {boolean}
  */
const addNewTxToAddress = function (tx, walletId) {
  if (tx.address && tx.txid) {
    const { type, path, found } = this.searchAddress(tx.address);
    if (!found) {
      console.log('Search was not successfull');
      return false;
    }
    this.store.wallets[walletId].addresses[type][path].transactions.push(tx.txid);
    // Because of the unclear state will force a refresh
    this.store.wallets[walletId].addresses[type][path].fetchedLast = 0;
    this.lastModified = +new Date();
    return true;
  }
  throw new Error('Invalid tx to add : tx');
};
module.exports = addNewTxToAddress;
