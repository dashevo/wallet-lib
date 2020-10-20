const Identifier = require('@dashevo/dpp/lib/Identifier');
const logger = require('../../../logger');

/**
 * @param {Buffer} publicKeyHash
 * @return {Promise<*|string>}
 */
module.exports = async function getIdentityIdByFirstPublicKey(publicKeyHash) {
  logger.silly('DAPIClientTransport.getIdentityIdByFirstPublicKey');

  const [identityId] = await this.client.platform.getIdentityIdsByPublicKeyHashes(
    [publicKeyHash],
  );

  if (identityId === null) {
    return null;
  }

  return new Identifier(identityId).toString();
};
