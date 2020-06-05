const { Address, Transaction } = require('@dashevo/dashcore-lib');
const _ = require('lodash');

/**
 * Return all the utxos (unspendable included)
 * @return {Array}
 */
function getUTXOS(onlyAvailable = true) {
  let utxos = [];

  const self = this;
  const { walletId, network } = this;

  for (let walletType in this.store.wallets[walletId].addresses) {
    for (let path in self.store.wallets[walletId].addresses[walletType]) {
      const address = self.store.wallets[walletId].addresses[walletType][path];
      for (let identifier in address.utxos) {
        const [txid, outputIndex] = identifier.split('-');

        utxos.push(new Transaction.UnspentOutput(
            {
              txId: txid,
              vout: parseInt(outputIndex),
              script: address.utxos[identifier].script,
              satoshis: address.utxos[identifier].satoshis,
              address: new Address(address.address, network)
            }));
      }
    }
  }
  return utxos.sort((a, b) => b.satoshis - a.satoshis);
}

module.exports = getUTXOS;
