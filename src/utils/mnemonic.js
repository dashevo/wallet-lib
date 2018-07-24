const Mnemonic = require('@dashevo/dashcore-mnemonic');

function generateNewMnemonic() {
  return Mnemonic();
}

function HDPrivateKeyToMnemonic(HDPrivKey) {
  // todo : Is this even possible ?
  const seed = HDPrivKey.toSeed();
  // console.log(seed)
  // eslint-disable-next-line new-cap
  return new Mnemonic.fromSeed(seed, Mnemonic.Words.ENGLISH);
}
/**
 * Will return the HDPrivateKey from a Mnemonic
 * @param {Mnemonic|String} mnemonic
 * @param {Networks | String} network
 * @param {String} passphrase
 * @return {HDPrivateKey}
 */
function mnemonicToSeed(mnemonic, network, passphrase = '') {
  if (!mnemonic) throw new Error('Expect mnemonic to be provided');

  return (mnemonic.constructor.name === 'Mnemonic')
    ? mnemonic.toHDPrivateKey(passphrase, network)
    : new Mnemonic(mnemonic).toHDPrivateKey(passphrase, network);
}


module.exports = {
  generateNewMnemonic,
  HDPrivateKeyToMnemonic,
  mnemonicToSeed
}