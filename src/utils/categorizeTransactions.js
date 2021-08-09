const _ = require('lodash');
const { each } = require('lodash');

function categorizeTransactions(transactionsWithMetadata, accountStore, accountIndex, isHDWallet) {
  const accountAddresses = accountStore.addresses;
  const categorizedTransactions = [];
  const predicate = (addr) => ({ address: addr.address });

  const filterInAccountPredicate = (addr) => !!(isHDWallet && parseInt(addr.path.split('/')[3], 10) === accountIndex);
  const filterOutAccountPredicate = (addr) => !!(isHDWallet && parseInt(addr.path.split('/')[3], 10) !== accountIndex);
  const changeAddresses = (isHDWallet)
    ? _.map(_.filter(accountAddresses.internal, filterInAccountPredicate), predicate)
    : _.map(accountAddresses.misc, predicate);
  const changeAddressList = changeAddresses.map((addr) => addr.address, []);

  const externalAddresses = (isHDWallet)
    ? _.map(_.filter(accountAddresses.external, filterInAccountPredicate), predicate)
    : _.filter(accountAddresses.misc, predicate);
  const externalAddressesList = externalAddresses.map((addr) => addr.address, []);
  const mergedAddresses = { ...accountAddresses.external, ...accountAddresses.internal };
  const otherAccountAddresses = (isHDWallet)
    ? _.map(_.filter(mergedAddresses, filterOutAccountPredicate), predicate)
    : [];
  const otherAccountAddressesList = otherAccountAddresses
    .map((addr) => addr.address, []);

  each(transactionsWithMetadata, (transactionWithMetadata) => {
    const [transaction, metadata] = transactionWithMetadata;
    console.log([transaction, metadata]);
    each(transaction.vout, (vout) => {

    });
    each(transaction.vin, (vin) => {

    });
    const categorizedTransaction = {
      transaction,
      type: 'unknown',
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
