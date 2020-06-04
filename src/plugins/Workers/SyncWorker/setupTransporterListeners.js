const EVENTS = require('../../../EVENTS');

module.exports = function setupListeners() {
  const { storage, transporter } = this;

  // For each new transaction emitted by transporter, we import to storage
  transporter.on(EVENTS.FETCHED_TRANSACTION, async (ev) => {
    const { payload: transaction } = ev;
    // Storage.importTransaction will announce the TX to parent
    await storage.importTransaction(transaction);
  });

  // For each UTXO that we fetch, we store them too as it will be used for payments
  transporter.on(EVENTS.FETCHED_UTXO, async (ev) => {
    const { payload: { output, transactionHash, outputIndex } } = ev;
    // Storage.importUTXO will announce the UTXO to parent
    await storage.importUTXO(output, transactionHash, outputIndex);
  });

  // The same is being done for fetch_address, but we also announce it.
  transporter.on(EVENTS.FETCHED_ADDRESS, async (ev) => {
    const { payload: address } = ev;
    this.announce(EVENTS.FETCHED_ADDRESS, address);
  });
};
