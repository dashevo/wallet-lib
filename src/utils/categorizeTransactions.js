const { each } = require('lodash');
const classifyAddresses = require('./classifyAddresses');

function categorizeTransactions(transactionsWithMetadata, accountStore, accountIndex, walletType, network = 'testnet') {
  const categorizedTransactions = [];
  console.log({ accountIndex, accountStore, walletType });
  const {
    externalAddressList,
    internalAddressList,
    otherAccountAddressList,
  } = classifyAddresses(accountStore.addresses, accountIndex, walletType);

  each(transactionsWithMetadata, (transactionWithMetadata) => {
    const [transaction, metadata] = transactionWithMetadata;
    const from = [];
    const to = [];
    let type = 'unknown';
    // For each vout, we will look at matching known addresses
    console.log('tx', transaction);
    each(transaction.outputs, (vout) => {
      const { satoshis, script } = vout;
      const address = script.toAddress(network).toString();
      if (address) {
        console.log(internalAddressList, address);
        console.log(externalAddressList, address);
        console.log(otherAccountAddressList, address);
        const isChange = internalAddressList.includes(address);
        const isExternal = externalAddressList.includes(address);
        const isOtherAccount = otherAccountAddressList.includes(address);

        if (isExternal || isChange) type = 'received';
        else if (isOtherAccount) type = 'transfer';
        else type = 'sent';
        to.push({
          address,
          satoshis,
        });
        // console.log(`vOut:${address}-Sat: ${satoshis} - isChange: ${isChange} - isExternal: ${isExternal} - isOtherAccount: ${isOtherAccount}`);
      }
    });
    // For each vin, we will look at matching known addresses
    // In order to know the value in, we would require fetching tx for output of vin info
    each(transaction.inputs, (vin) => {
      const { script } = vin;
      const address = script.toAddress(network).toString();
      if (address) {
        console.log(internalAddressList, address);
        console.log(externalAddressList, address);
        console.log(otherAccountAddressList, address);
        const isChange = internalAddressList.includes(address);
        const isExternal = externalAddressList.includes(address);
        const isOtherAccount = otherAccountAddressList.includes(address);
        console.log(`vIn:${address} - isChange: ${isChange} - isExternal: ${isExternal} - isOtherAccount: ${isOtherAccount}`);
        from.push({
          address,
        });
        if (isOtherAccount) type = 'transfer';
        if (isExternal || isChange) type = 'sent';
      }
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
