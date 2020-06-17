const logger = require('../../../../logger');

module.exports = async function disconnect() {
  logger.silly('DAPIClient.disconnecting');
  const { executors, subscriptions } = this.state;
  clearInterval(executors.blocks);
  clearInterval(executors.blockHeaders);
  clearInterval(executors.addresses);

  subscriptions.transactions.forEach((stream) => {
    logger.silly('DAPIClient.disconnecting stream');
    stream.cancel();
  });
};
