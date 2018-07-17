const Mnemonic = require('@dashevo/dashcore-mnemonic');
// const DashcoreLib = require('@dashevo/dashcore-lib');
const { DUFFS_PER_DASH } = require('./Constants');

function dashToDuffs(dash) {
  if (dash === undefined || dash.constructor.name !== 'Number') {
    throw new Error('Can only convert a number');
  }
  return parseInt((dash * DUFFS_PER_DASH).toFixed(0), 10);
}
function duffsToDash(duffs) {
  if (duffs === undefined || duffs.constructor.name !== 'Number') {
    throw new Error('Can only convert a number');
  }
  return duffs / DUFFS_PER_DASH;
}
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

const is = {
  // Primitives
  arr: arr => Array.isArray(arr) || arr.constructor.name === 'Array',
  num: num => !Number.isNaN(num) && typeof num === 'number',
  float: (float => is.num(float) && Math.floor(float) !== float),
  int: int => Number.isInteger(int) || (int => is.num(int) && Math.floor(int) === int),
  hex: h => parseInt(h.toLowerCase(), 16).toString(16) === h.toLowerCase(),
  string: str => typeof str === 'string',
  bool: b => b === true || b === false,
  obj: obj => obj && (obj.constructor === Object || obj.constructor === undefined),
  fn: fn => typeof fn === 'function',
  type(val, type) { return val.constructor.name === type; },
  def: val => val !== undefined,
  undef: val => val === undefined,
  null: val => val === null,
  promise: fn => fn && is.fn(fn.then) && is.fn(fn.catch),
  obs: obs => is.fn(obs) && is.fn(obs.set),
  event: ev => is.fn(ev.listen) && is.fn(ev.broadcast),
  JSON(val) { try { JSON.stringify(val); return true; } catch (e) { return false; } },
  stringified(val) { try { JSON.parse(val); return true; } catch (e) { return false; } },
  mnemonic: mnemonic => is.string(mnemonic) || is.type(mnemonic, 'Mnemonic'),
  network: network => is.string(network) || is.type(network, 'Network'),
  seed: seed => is.string(seed) || is.type(seed, 'HDPrivateKey'),
};
module.exports = {
  dashToDuffs,
  duffsToDash,
  generateNewMnemonic,
  mnemonicToSeed,
  HDPrivateKeyToMnemonic,
  is,
};
