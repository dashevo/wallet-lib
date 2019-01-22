/**
 * Get all the transaction history already formated
 * todo: add a raw format
 * @return {Promise<any[]>}
 */
async function getTransactionHistory() {
  const self = this;
  let txs = [];
  const { walletId } = this;
  const store = this.storage.getStore();
  Object.keys(store.wallets[walletId].addresses.external).forEach((key) => {
    const el = store.wallets[walletId].addresses.external[key];
    if (el.transactions && el.transactions.length > 0) {
      txs = txs.concat(el.transactions);
    }
  });
  Object.keys(store.wallets[walletId].addresses.internal).forEach((key) => {
    const el = store.wallets[walletId].addresses.internal[key];
    if (el.transactions && el.transactions.length > 0) {
      txs = txs.concat(el.transactions);
    }
  });

  txs = txs.filter((item, pos, txslist) => txslist.indexOf(item) === pos);
  const p = [];

  txs.forEach((txid) => {
    const search = self.storage.searchTransaction(txid);
    if (!search.found) {
      p.push(self.getTransaction(txid));
    } else {
      p.push(search.result);
    }
  });

  const resolvedPromises = await Promise.all(p) || [];

  function cleanUnknownAddr(data, wId) {
    const selfStore = self.storage.getStore();
    const knownAddr = [];
    Object.keys(selfStore.wallets[wId].addresses.external).forEach((key) => {
      const el = selfStore.wallets[wId].addresses.external[key];
      knownAddr.push(el.address);
    });
    Object.keys(selfStore.wallets[wId].addresses.internal).forEach((key) => {
      const el = selfStore.wallets[wId].addresses.internal[key];
      knownAddr.push(el.address);
    });
    Object.keys(selfStore.wallets[wId].addresses.misc).forEach((key) => {
      const el = selfStore.wallets[wId].addresses.misc[key];
      knownAddr.push(el.address);
    });

    return data.filter(el => (knownAddr.includes(el.address)))[0];
  }

  const history = resolvedPromises.map((el) => {
    let isSent = false;
    if (el.vin) {
      el.vin.forEach((vin) => {
        const { addr } = vin;
        if (this.storage.searchAddress(addr).found) {
          isSent = true;
        }
      });
    }

    const cleanElement = {
      type: (isSent) ? 'sent' : 'receive',
      txid: el.txid,
      time: el.time || el.blocktime || 0,
      from: (el.vin) ? el.vin.map(vin => vin.addr) : 'unknown',
    };
    if (el.vout) {
      cleanElement.to = cleanUnknownAddr(el.vout.map(vout => ({
        address: vout.scriptPubKey.addresses[0],
        amount: vout.value,
      })), this.walletId);
    } else {
      cleanElement.to = 'unknown';
    }


    return cleanElement;
  });

  return history;
}
module.exports = getTransactionHistory;
