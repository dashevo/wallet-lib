const EVENTS = require('../../../../EVENTS');

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

module.exports = async function subscribeToAddressesTransactions(addresses) {
  const self = this;
  const { subscriptions } = this.state;

  const executor = async (addr) => {
    if (!self.state.addressesTransactionsMap[addr]) {
      self.state.addressesTransactionsMap[addr] = {};
    }
    const utxos = (await self.getUTXO(addr)).items;
    utxos.forEach((utxo) => {
      const { txid, outputIndex } = utxo;
      if (self.state.addressesTransactionsMap[addr][txid] === undefined) {
        self.getTransaction(txid).then((tx) => {
          self.state.addressesTransactionsMap[addr][txid] = outputIndex;
          self.announce(EVENTS.TRANSACTION, tx);
        });
      }
    });
  };

  addresses.forEach((address) => {
    executor(address);
    if (!subscriptions.addresses[address]) {
      subscriptions.addresses[address] = setInterval(() => executor(address), fastFetchThreshold);
    }
  });
};
