const { each } = require('lodash');
const classifyAddresses = require('./classifyAddresses');
const { TRANSACTION_HISTORY_TYPES } = require('../CONSTANTS');

// TODO: On a private key based wallet, as change and external is similar,
//  we actually cannot differentiate correctly from an address_transfer
//  and a sent transaction where our own address is a change...
const determineType = (inputsDetection, outputsDetection) => {
  let type = TRANSACTION_HISTORY_TYPES.UNKNOWN;
  if (inputsDetection.hasExternalAddress) {
    type = TRANSACTION_HISTORY_TYPES.RECEIVED;
  }
  if (outputsDetection.hasExternalAddress) {
    type = TRANSACTION_HISTORY_TYPES.RECEIVED;
  }
  if (
    !outputsDetection.hasExternalAddress
      && (inputsDetection.hasChangeAddress || inputsDetection.hasExternalAddress)
  ) {
    type = TRANSACTION_HISTORY_TYPES.SENT;
  }
  if (inputsDetection.hasExternalAddress && outputsDetection.hasExternalAddress) {
    type = TRANSACTION_HISTORY_TYPES.ADDRESS_TRANSFER;
  } else if (
    (inputsDetection.hasExternalAddress && outputsDetection.hasOtherAccountAddress)
      || (inputsDetection.hasOtherAccountAddress && outputsDetection.hasExternalAddress)
  ) {
    type = TRANSACTION_HISTORY_TYPES.ACCOUNT_TRANSFER;
  }
  return type;
};

function categorizeTransactions(
  transactionsWithMetadata,
  walletStore,
  accountIndex,
  walletType,
  network,
) {
  const categorizedTransactions = [];

  const {
    externalAddressesList,
    internalAddressesList,
    otherAccountAddressesList,
  } = classifyAddresses(walletStore, accountIndex, walletType, network);

  each(transactionsWithMetadata, (transactionWithMetadata) => {
    const [transaction, metadata] = transactionWithMetadata;
    const from = [];
    const to = [];

    let outputsHasChangeAddress = false;
    let outputsHasExternalAddress = false;
    let outputsHasOtherAccountAddress = false;

    let inputsHasChangeAddress = false;
    let inputsHasExternalAddress = false;
    let inputsHasOtherAccountAddress = false;

    // For each vout, we will look at matching known addresses
    transaction.outputs.forEach((vout) => {
      const { satoshis, script } = vout;
      const address = script.toAddress(network).toString();
      if (address) {
        if (internalAddressesList.includes(address)) outputsHasChangeAddress = true;
        if (externalAddressesList.includes(address)) outputsHasExternalAddress = true;
        if (otherAccountAddressesList.includes(address)) outputsHasOtherAccountAddress = true;
        to.push({
          address,
          satoshis,
        });
      }
    });
    // For each vin, we will look at matching known addresses
    // In order to know the value in, we would require fetching tx for output of vin info
    transaction.inputs.forEach((vin) => {
      const { script } = vin;
      const address = script.toAddress(network).toString();
      if (address) {
        if (internalAddressesList.includes(address)) inputsHasChangeAddress = true;
        if (externalAddressesList.includes(address)) inputsHasExternalAddress = true;
        if (otherAccountAddressesList.includes(address)) inputsHasOtherAccountAddress = true;
        from.push({
          address,
        });
      }
    });

    const type = determineType({
      hasChangeAddress: inputsHasChangeAddress,
      hasExternalAddress: inputsHasExternalAddress,
      hasOtherAccountAddress: inputsHasOtherAccountAddress,
    }, {
      hasChangeAddress: outputsHasChangeAddress,
      hasExternalAddress: outputsHasExternalAddress,
      hasOtherAccountAddress: outputsHasOtherAccountAddress,
    });

    const categorizedTransaction = {
      from,
      to,
      transaction,
      type,
      blockHash: metadata.blockHash,
      height: metadata.height,
      isInstantLocked: metadata.instantLocked,
      isChainLocked: metadata.chainLocked,
    };
    categorizedTransactions.push(categorizedTransaction);
  });

  return categorizedTransactions;
}

module.exports = categorizeTransactions;
