const logger = require('../../../logger');

module.exports = async function getIdentityIdByFirstPublicKey(publicKeyHash) {
  logger.silly('DAPIClientTransport.getIdentityIdByFirstPublicKey');

  const [identityId] = await this.client.platform.getIdentityIdsByPublicKeyHashes(
    [Buffer.from(publicKeyHash)],
  );

  return identityId;
};
