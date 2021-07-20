/**
 *
 * @param userUniqueId
 * @param contactUniqueId
 * @param index
 * @param accountIndex
 * @returns {HDPrivateKey}
 */
function getDIP15ExtendedPrivateKey(userUniqueId, contactUniqueId, index = 0, accountIndex = 0) {
  if (!['HDPrivateKey', 'HDPublicKey'].includes(this.type)) {
    throw new Error('Wallet is not loaded from a mnemonic or a HDPubKey, impossible to derivate keys');
  }
  if (!userUniqueId || !contactUniqueId) throw new Error('Required userUniqueId and contactUniqueId to be defined');

  return this
    .getHardenedDIP15AccountKey(accountIndex)
    .deriveChild((userUniqueId), true)
    .deriveChild((contactUniqueId), true)
    .deriveChild(index, false);
}
module.exports = getDIP15ExtendedPrivateKey;
