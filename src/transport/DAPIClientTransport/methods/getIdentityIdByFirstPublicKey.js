const logger = require('../../../logger');

module.exports = async function getIdentityIdByFirstPublicKey(publicKeyHash) {
  logger.silly('DAPIClientTransport.getIdentityIdByFirstPublicKey');

  const [identityId] = await this.client.platform.getIdentityIdsByPublicKeyHashes([publicKeyHash]);

  return identityId;
};
