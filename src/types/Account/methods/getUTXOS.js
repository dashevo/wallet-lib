const { Address, Transaction } = require('@dashevo/dashcore-lib');
const { NULL_HASH } = require('../../../CONSTANTS');
const NULL_BUFFER = Buffer.from(NULL_HASH, 'hex');
/**
 * Return all the utxos
 * @return {UnspentOutput[]}
 */
function getUTXOS() {
  const utxos = [];

  const self = this;
  const { walletId, network } = this;
  const currentBlockHeight = this.store.chains[network].blockHeight;
  /* eslint-disable-next-line no-restricted-syntax */
  for (const walletType in this.store.wallets[walletId].addresses) {
    if (walletType && ['external', 'internal', 'misc'].includes(walletType)) {
      /* eslint-disable-next-line no-restricted-syntax */
      for (const path in self.store.wallets[walletId].addresses[walletType]) {
        if (path) {
          const address = self.store.wallets[walletId].addresses[walletType][path];
          /* eslint-disable-next-line no-restricted-syntax */
          for (const identifier in address.utxos) {
            if (identifier) {
              const [txid, outputIndex] = identifier.split('-');
              const transaction = this.store.transactions[txid];
              const isCoinbase = Buffer.compare(transaction.inputs[0].prevTxId, NULL_BUFFER) === 0;
              if (isCoinbase) {
                // We check maturity is at least 100 blocks.
                const { height } = transaction.extraPayload;
                // another way is to just read _scriptBuffer height value.
                if (height + 100 > currentBlockHeight) {
                  // eslint-disable-next-line no-continue
                  continue;
                }
              }
              utxos.push(new Transaction.UnspentOutput(
                {
                  txId: txid,
                  vout: parseInt(outputIndex, 10),
                  script: address.utxos[identifier].script,
                  satoshis: address.utxos[identifier].satoshis,
                  address: new Address(address.address, network),
                },
              ));
            }
          }
        }
      }
    }
  }
  return utxos.sort((a, b) => b.satoshis - a.satoshis);
}

module.exports = getUTXOS;
