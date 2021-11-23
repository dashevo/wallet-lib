const { Transaction } = require('@dashevo/dashcore-lib');
const { is } = require('../../../utils');
const { FETCHED_CONFIRMED_TRANSACTION, UPDATED_ADDRESS } = require('../../../EVENTS');

const { Output } = Transaction;

function considerTransaction(transactionHash) {
  const { transaction } = this.getTransaction(transactionHash);

  const { inputs, outputs } = transaction;
  let outputIndex = -1;

  const processedAddressesForTx = {};

  [...inputs, ...outputs].forEach((element) => {
    const isOutput = (element instanceof Output);
    if (isOutput) outputIndex += 1;

    if (element.script) {
      const address = element.script.toAddress(this.network).toString();
      const watchedAddress = this.getAddress(address);

      if (watchedAddress) {
        // If the transactions has already been processed in a previous insertion,
        // we can skip the processing now, it's important to do so as we might consider
        // the same transaction multiple times (e.g: on address import)
        if (watchedAddress.transactions.includes(transactionHash)) {
          return;
        }

        // We mark our address as affected so we update the tx later on
        if (!processedAddressesForTx[watchedAddress.address]) {
          processedAddressesForTx[watchedAddress.address] = watchedAddress;
        }

        if (!isOutput) {
          const vin = element;
          const utxoKey = `${vin.prevTxId.toString('hex')}-${vin.outputIndex}`;
          if (watchedAddress.utxos[utxoKey]) {
            const previousOutput = watchedAddress.utxos[utxoKey];
            watchedAddress.balanceSat -= previousOutput.satoshis;
            delete watchedAddress.utxos[utxoKey];
          }
        } else {
          const vout = element;

          const utxoKey = `${transaction.hash}-${outputIndex}`;
          if (!watchedAddress.utxos[utxoKey]) {
            watchedAddress.utxos[utxoKey] = vout.toJSON();
            watchedAddress.balanceSat += vout.satoshis;
          }
        }
      }
    }
  });

  // As the same address can have one or more inputs and one or more outputs in the same tx
  // we update it's transactions array as last step of importing
  Object.values(processedAddressesForTx).forEach((addressObject) => {
    addressObject.transactions.push(transaction.hash);
  });
}
module.exports = considerTransaction;
