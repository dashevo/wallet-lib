const { dashToDuffs, duffsToDash } = require('./utils');
const { generateNewMnemonic, HDPrivateKeyToMnemonic, mnemonicToSeed } = require('./mnemonic.js');
const is = require('./is');
const coinSelection = require('./coinSelection');
const feeCalculation = require('./feeCalculation');

module.exports = {
  dashToDuffs,
  duffsToDash,
  generateNewMnemonic,
  mnemonicToSeed,
  HDPrivateKeyToMnemonic,
  is,
  coinSelection,
  feeCalculation,
};
