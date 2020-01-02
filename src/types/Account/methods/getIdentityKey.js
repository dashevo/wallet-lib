/**
 * Returns a private key for managing an identity
 * @param {number} index - index of an identity
 * @return {PrivateKey}
 */
function getIdentityKey(index) {
  // TODO: add proper feature-based derivation
  const { address } = this.getAddress(index);
  const [privateKey] = this.getPrivateKeys([address]);
  return privateKey.privateKey;
}

module.exports = getIdentityKey;
