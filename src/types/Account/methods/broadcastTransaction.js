const Dashcore = require('@dashevo/dashcore-lib');
const { is } = require('../../../utils');
const {
  ValidTransportLayerRequired,
  InvalidRawTransaction,
  InvalidDashcoreTransaction,
} = require('../../../errors');

function impactAffectedInputs({ transaction, txid }) {
  const { inputs, changeIndex } = transaction.toObject();

  const {
    storage, walletId, network,
  } = this;

  // We iterate out input to substract their balance.
  inputs.forEach((input) => {
    const potentiallySelectedAddresses = storage.searchAddressesWithTx(input.prevTxId);
    // Fixme : If you want this check, you will need to modify fixtures of our tests.
    // if (!potentiallySelectedAddresses.found) {
    //   throw new Error('Input is not part of that Wallet.');
    // }
    potentiallySelectedAddresses.results.forEach((potentiallySelectedAddress) => {
      const { type, path } = potentiallySelectedAddress;
      if (potentiallySelectedAddress.utxos[`${input.prevTxId}-${input.outputIndex}`]) {
        const inputUTXO = potentiallySelectedAddress.utxos[`${input.prevTxId}-${input.outputIndex}`];
        const address = storage.store.wallets[walletId].addresses[type][path];
        // Todo: This modify the balance of an address, we need a std method to do that instead.
        if (address.unconfirmedBalanceSat > 0) {
          address.unconfirmedBalanceSat -= inputUTXO.satoshis;
        } else {
          address.balanceSat -= inputUTXO.satoshis;
        }

        delete address.utxos[`${input.prevTxId}-${input.outputIndex}`];
      }
    });
  });

  const changeOutput = transaction.getChangeOutput();
  if (changeOutput) {
    const addressString = changeOutput.script.toAddress(network);

    const mapped = storage.mappedAddress[addressString];

    const { type, path } = mapped;
    const address = storage.store.wallets[walletId].addresses[type][path];
    address.utxos[`${txid}-${changeIndex}`] = new Dashcore.Transaction.UnspentOutput(
      {
        txId: txid,
        vout: changeIndex,
        script: changeOutput.script,
        satoshis: changeOutput.satoshis,
        address: addressString,
      },
    );
    address.unconfirmedBalanceSat = changeOutput.satoshis;
  }

  return true;
}

/**
 * Broadcast a Transaction to the transport layer
 * @param {Transaction|RawTransaction} transaction - A txobject or it's hexadecimal representation
 * @param {Object} [options]
 * @param {Boolean} [options.skipFeeValidation=false] - Allow to skip fee validation
 * @return {Promise<transactionId>}
 */
async function broadcastTransaction(transaction, options = {}) {
  const { network, storage } = this;
  const { chains } = storage.getStore();
  if (!this.transport) throw new ValidTransportLayerRequired('broadcast');

  // We still support having in rawtransaction, if this is the case
  // we first need to reform our object
  if (is.string(transaction)) {
    const rawtx = transaction.toString();
    if (!is.rawtx(rawtx)) throw new InvalidRawTransaction(rawtx);
    return broadcastTransaction.call(this, new Dashcore.Transaction(rawtx));
  }

  if (!is.dashcoreTransaction(transaction)) {
    throw new InvalidDashcoreTransaction(transaction);
  }

  if (!transaction.isFullySigned()) {
    throw new Error('Transaction not signed.');
  }

  // const { inputs } = transaction.toObject();
  const { minRelay: minRelayFeeRate } = chains[network.toString()].fees;

  // eslint-disable-next-line no-underscore-dangle
  const estimateKbSize = transaction._estimateSize() / 1000;
  const minRelayFee = Math.ceil(estimateKbSize * minRelayFeeRate);

  if (minRelayFee > transaction.getFee() && !options.skipFeeValidation) {
    throw new Error(`Expected minimum fee for transaction ${minRelayFee}. Current: ${transaction.getFee()}`);
  }
  const serializedTransaction = transaction.toString();

  const txid = await this.transport.sendTransaction(serializedTransaction);
  // We now need to impact/update our affected inputs
  // so we clear them out from UTXOset.
  impactAffectedInputs.call(this, {
    transaction,
    txid,
  });

  return txid;
}

module.exports = broadcastTransaction;
