const Mnemonic = require('@dashevo/dashcore-mnemonic');
const { hash256 } = require('./crypto');

function generateNewMnemonic() {
  return Mnemonic();
}

// function HDPrivateKeyToMnemonic(HDPrivKey) {
// todo : Is this even possible ?
// const seed = HDPrivKey.toSeed();
// console.log(seed)
// eslint-disable-next-line new-cap
// return new Mnemonic.fromSeed(seed, Mnemonic.Words.ENGLISH);
// }
/**
 * Will return the HDPrivateKey from a Mnemonic
 * @param {Mnemonic|String} mnemonic
 * @param {Networks | String} network
 * @param {String} passphrase
 * @return {HDPrivateKey}
 */
function mnemonicToSeed(mnemonic, network, passphrase = '') {
  if (!mnemonic) throw new Error('Expect mnemonic to be provided');
  // const seed = (mnemonic.constructor.name === 'Mnemonic')
  //   ? mnemonic.toHDPrivateKey(passphrase, network)
  //   : new Mnemonic(mnemonic).toHDPrivateKey(passphrase, network);
  // if (mnemonic.constructor.name === 'Mnemonic') {
  //   console.log('--',new Mnemonic(mnemonic).toHDPrivateKey(passphrase, network));
  // }
  // console.log('mnemonictoseed');
  // return seed;
  return (mnemonic.constructor.name === 'Mnemonic')
    ? mnemonic.toHDPrivateKey(passphrase, network)
    : new Mnemonic(mnemonic).toHDPrivateKey(passphrase, network);
}

function mnemonicToWalletId(mnemonic) {
  if (!mnemonic) throw new Error('Expect mnemonic to be provided');
  const buffMnemonic = Buffer.from(mnemonic.toString())
  const buff = hash256(buffMnemonic);
  const walletId = buff.toString('hex').slice(0, 10);
  return walletId;
}

module.exports = {
  generateNewMnemonic,
  // HDPrivateKeyToMnemonic,
  mnemonicToSeed,
  mnemonicToWalletId
};
