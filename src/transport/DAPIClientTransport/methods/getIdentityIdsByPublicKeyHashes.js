const logger = require('../../../logger');

module.exports = async function getIdentityIdsByPublicKeyHashes(publicKeyHashes) {
  logger.silly('DAPIClientTransport.getIdentityIdsByPublicKeyHashes');

  return this.client.platform.getIdentityIdsByPublicKeyHashes(publicKeyHashes);
};
