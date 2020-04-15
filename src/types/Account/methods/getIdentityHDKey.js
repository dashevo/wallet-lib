/**
 * Returns a private key for managing an identity
 * @param {number} index - index of an identity
 * @param {string} identityType - type of identity (user, application)
 * @return {PrivateKey}
 */
function getIdentityHDKey(keyIndex = 0) {
  const { keyChain, index: accountIndex } = this;
  const hardenedFeatureRootKey = keyChain.getHardenedDIP9FeaturePath();

  const identityFeatureKey = hardenedFeatureRootKey.deriveChild(5, true);

  return identityFeatureKey
    .deriveChild(accountIndex, true)
  // In dpp 12.0, Identity.Types has been removed.
  // TODO: To be changed when changes associated with derivation are specified in a DIP.
    .deriveChild(0, false)
    .deriveChild(keyIndex, false);
}

module.exports = getIdentityHDKey;
