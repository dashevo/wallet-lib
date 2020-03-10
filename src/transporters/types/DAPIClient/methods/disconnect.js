module.exports = async function disconnect() {
  const { subscriptions } = this.state;
  clearInterval(subscriptions.blocks);
  clearInterval(subscriptions.blockHeaders);
  for (const addr in subscriptions.addresses) {
    clearInterval(subscriptions.addresses[addr]);
  }
};
