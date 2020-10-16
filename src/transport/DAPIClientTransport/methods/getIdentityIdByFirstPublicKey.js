const Identifier = require('@dashevo/dpp/lib/Identifier');
const logger = require('../../../logger');

module.exports = async function getIdentityIdByFirstPublicKey(publicKeyHash) {
  logger.silly('DAPIClientTransport.getIdentityIdByFirstPublicKey');

  const [identityId] = await this.client.platform.getIdentityIdsByPublicKeyHashes(
    [publicKeyHash],
  );

  return identityId === null ? identityId : new Identifier(identityId).toString();
};
