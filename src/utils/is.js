//Todo : Some validators here are really proto type of methods, urgent impr is needed here.
const { PrivateKey,HDPrivateKey } = require('@dashevo/dashcore-lib');
const is = {
  // Primitives
  arr: arr => Array.isArray(arr) || arr.constructor.name === 'Array',
  num: num => !Number.isNaN(num) && typeof num === 'number',
  float: (float => is.num(float) && Math.floor(float) !== float),
  int: int => Number.isInteger(int) || (is.num(int) && Math.floor(int) === int),
  hex: h => is.string(h) && (h.match(/([0-9]|[a-f])/gim) || []).length === h.length,
  string: str => typeof str === 'string',
  bool: b => b === true || b === false,
  obj: obj => obj && obj && obj === Object(obj),
  fn: fn => typeof fn === 'function',
  type(val, type) { return val.constructor.name === type; },
  def: val => val !== undefined,
  undef: val => val === undefined,
  null: val => val === null,
  promise: fn => fn && is.fn(fn.then) && is.fn(fn.catch),
  JSON(val) { try { JSON.stringify(val); return true; } catch (e) { return false; } },
  stringified(val) { try { JSON.parse(val); return true; } catch (e) { return false; } },
  mnemonic: mnemonic => is.string(mnemonic) || is.type(mnemonic, 'Mnemonic'),
  network: network => is.string(network) || is.type(network, 'Network'),
  privateKey: pKey => is.type(pKey, 'PrivateKey') || (is.string(pKey) && PrivateKey.isValid(pKey)),
  seed: seed => is.type(seed, 'HDPrivateKey') || (is.string(seed) && HDPrivateKey.isValidSerialized(seed)),
  address: addr => is.string(addr) || is.type(addr, 'Address'),
  transaction: tx => is.obj(tx) && tx.vin && is.arr(tx.vin) && tx.vout && is.arr(tx.vout),
  feeRate: feeRate => is.obj(feeRate) && is.string(feeRate.type) && is.int(feeRate.value),
  txid: txid => is.string(txid),
  utxo: utxo => is.obj(utxo) && utxo.txId && is.num(utxo.outputIndex)
    && utxo.script && is.num(utxo.satoshis),
  output: output => is.obj(output) && is.num(output.satoshis) && is.address(output.address),
};
module.exports = is;
