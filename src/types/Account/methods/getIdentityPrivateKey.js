/**
 * Return the identity private key corresponding to the index
 * @param index<number>
 * @return PrivateKey
 */
function getIdentityPrivateKey(index) {
  // TODO: add proper feature-based derivation
  const { address } = this.getAddress(index);
  const [privateKey] = this.getPrivateKeys([address]);
  return privateKey.privateKey;
}

module.exports = getIdentityPrivateKey;
