/**
 * Return all the private keys matching the PubKey Addr List
 * @param index<number>
 * @return <HDPrivateKey>
 */
function getPrivateKeys(index) {
  // TODO: add proper feature-based derivation
  const { address } = this.getAddress(index);
  const [privateKey] = this.getPrivateKeys([address]);
  return privateKey;
}

module.exports = getPrivateKeys;
