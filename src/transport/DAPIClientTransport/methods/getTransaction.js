const { Transaction } = require('@dashevo/dashcore-lib');
const NotFoundError = require('@dashevo/dapi-client/lib/methods/errors/NotFoundError');
const grpcErrorCodes = require('@dashevo/grpc-common/lib/server/error/GrpcErrorCodes');
const { is } = require('../../../utils');
const logger = require('../../../logger');

module.exports = async function getTransaction(txid) {
  logger.silly(`DAPIClient.getTransaction[${txid}]`);
  if (!is.txid(txid)) {
    throw new Error(`Received an invalid txid to fetch : ${txid}`);
  }

  try {
    const response = await this.client.core.getTransaction(txid);
    return new Transaction(response.getTransaction());
  } catch (e) {
    if (e instanceof NotFoundError && e.getCode() === grpcErrorCodes.NOT_FOUND) {
      return null;
    }

    throw e;
  }
};
