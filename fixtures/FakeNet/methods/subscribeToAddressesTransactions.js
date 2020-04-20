const EVENTS = require('../../../src/EVENTS');
const logger = require('../../../src/logger');
// Artifact from previous optimisation made in SyncWorker plugin
// Kept for reminder when Bloomfilters

// Thoses are addresses that were used only once, and long time ago.
// Low chance of receiving fund. We still check every ten minutes
// const slowFetchThresold = 5 * 60 * 1000;
// Those are addresses that we consider standard, InstantSend promise a one minute time,
// That is what we offer here (will be changed with streams)
// const fetchThreshold = 60 * 1000;
// Those are special cases, such as the current unusedAddress for instance,
// Higher chance of receiving tx, we listen in a quite spammy ways.
const fastFetchThreshold = 15 * 1000;

// Loop will go through every 15 sec

async function executor(forcedAddressList = null) {
  const self = this;
  const { addresses } = self.state.subscriptions;
  const addressList = forcedAddressList || Object.keys(addresses);
  logger.silly(`FakeNet.subscribeToAddrTx.executor[${addressList}]`);
  const fetchedUtxos = {};
  addressList.forEach((address) => {
    addresses[address].last = +new Date();
    fetchedUtxos[address] = [];
  });

  const utxos = (await self.getUTXO(addressList));

  utxos.forEach((utxo) => {
    const { address, txid, outputIndex } = utxo;
    fetchedUtxos[address].push(utxo);
    if (self.state.addressesTransactionsMap[address][txid] === undefined) {
      self.getTransaction(txid).then((tx) => {
        self.state.addressesTransactionsMap[address][txid] = outputIndex;
        self.announce(EVENTS.FETCHED_TRANSACTION, tx);
      });
    }
  });
  addressList.forEach((address) => {
    self.announce(EVENTS.FETCHED_ADDRESS, { address, utxos: fetchedUtxos[address] });
  });
}

function startExecutor() {
  const self = this;
  logger.silly('FakeNet.subscribeToAddressesTransactions.startExecutor');
  this.state.executors.addresses = setInterval(() => executor.call(self), fastFetchThreshold);
}

module.exports = async function subscribeToAddressesTransactions(addressList) {
  logger.silly(`FakeNet.subscribeToAddressesTransactions[${addressList}]`);
  if (!Array.isArray(addressList)) throw new Error('Expected array of addresses');
  const { executors, subscriptions, addressesTransactionsMap } = this.state;

  const immediatelyExecutedAddresses = [];
  addressList.forEach((address) => {
    if (!subscriptions.addresses[address]) {
      if (!addressesTransactionsMap[address]) {
        addressesTransactionsMap[address] = {};
      }
      immediatelyExecutedAddresses.push(address);
      subscriptions.addresses[address] = { priority: 1, last: null };
    }
  });

  if (!executors.addresses) {
    startExecutor.call(this);
  }
  if (immediatelyExecutedAddresses.length) {
    await Promise.resolve(executor.call(this, immediatelyExecutedAddresses));
  }
};
