const TxStreamDataResponseMock = require('./TxStreamDataResponseMock');
const TxStreamMock = require('./TxStreamMock');
const TransportMock = require('./TransportMock');

module.exports = async function createAndAttachTransportMocksToWallet(wallet, sinon) {
  const txStreamMock = new TxStreamMock();
  const transportMock = new TransportMock(sinon, txStreamMock);

  // eslint-disable-next-line no-param-reassign
  wallet.transport = transportMock;

  await Promise.all([
    wallet.getAccount(),
    new Promise((resolve) => {
      setTimeout(() => {
        txStreamMock.emit(TxStreamMock.EVENTS.end);
        resolve();
      }, 10);
    }),
  ]);

  return { txStreamMock, transportMock };
};
