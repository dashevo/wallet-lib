const { Address, Transaction } = require('@dashevo/dashcore-lib');
const { WALLET_TYPES } = require('../../../CONSTANTS');
/**
 * Return all the utxos
 * @return {UnspentOutput[]}
 */
function getUTXOS() {
  const utxos = [];

  const self = this;
  const {
    walletId, network, BIP44PATH, walletType,
  } = this;
  const currentBlockHeight = this.store.chains[network].blockHeight;
  /* eslint-disable-next-line no-restricted-syntax */
  for (const addressType in this.store.wallets[walletId].addresses) {
    if (addressType && ['external', 'internal', 'misc'].includes(addressType)) {
      /* eslint-disable-next-line no-restricted-syntax */
      for (const path in self.store.wallets[walletId].addresses[addressType]) {
        if (path) {
          const address = self.store.wallets[walletId].addresses[addressType][path];
          if (
            [WALLET_TYPES.HDPUBLIC, WALLET_TYPES.HDWALLET].includes(walletType)
              && !path.startsWith(BIP44PATH)) {
            // eslint-disable-next-line no-continue
            continue;
          }
          /* eslint-disable-next-line no-restricted-syntax */
          for (const identifier in address.utxos) {
            if (identifier) {
              const [txid, outputIndex] = identifier.split('-');
              const transaction = this.store.transactions[txid];
              if (transaction.isCoinbase()) {
                // If the transaction is not a special transaction, we can't check its
                // maturity at the moment of writing this comment.
                // The wallet library doesn't maintain the header chain and thus we can
                // figure out the height only from the payload, but old coinbase transactions
                // doesn't have a payload.
                if (!transaction.isSpecialTransaction()) {
                  // eslint-disable-next-line no-continue
                  continue;
                }
                // We check maturity is at least 100 blocks.
                // another way is to just read _scriptBuffer height value.
                if (transaction.extraPayload.height + 100 > currentBlockHeight) {
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
