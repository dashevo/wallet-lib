function importAddress(address) {
  if (this.state.addresses.has(address.toString())) throw new Error('Address is already inserted');

  this.state.addresses.set(address.toString(), {
    address: address.toString(),
    transactions: [],
    utxos: {},
    balanceSat: 0,
    unconfirmedBalanceSat: 0,
  });

  // We need to consider all previous transactions
  [...this.state.transactions].forEach(([transactionHash]) => {
    this.considerTransaction(transactionHash);
  });
}

module.exports = importAddress;
