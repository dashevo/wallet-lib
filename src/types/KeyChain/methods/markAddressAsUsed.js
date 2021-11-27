const logger = require('../../../logger');

function markAddressAsUsed(address) {
  logger.silly(`KeyChain - Marking ${address} as used`);

  const searchResult = [...this.issuedPaths.entries()]
    .find(([, el]) => el.address.toString() === address.toString());

  const [, addressData] = searchResult;

  addressData.isUsed = true;

  return this.maybeLookAhead();
}
module.exports = markAddressAsUsed;
