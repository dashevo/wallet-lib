const extendTransactionsWithMetadata = require('./extendTransactionsWithMetadata');
const categorizeTransactions = require('./categorizeTransactions');
const filterTransactions = require('./filterTransactions');
const { hash, doubleSha256, sha256 } = require('./crypto');
const { varIntSizeBytesFromLength } = require('./varInt');
const feeCalculation = require('./feeCalculation');
const coinSelection = require('./coinSelection');
const fundWallet = require('./fundWallet');
const dashToDuffs = require('./dashToDuffs');
const duffsToDash = require('./duffsToDash');
const getBytesOf = require('./getBytesOf');
const hasMethod = require('./hasMethod');
const hasProp = require('./hasProp');
const mnemonic = require('./mnemonic');
const is = require('./is');

const {
  generateNewMnemonic,
  mnemonicToHDPrivateKey,
  mnemonicToWalletId,
  seedToHDPrivateKey,
  mnemonicToSeed,
} = mnemonic;

module.exports = {
  categorizeTransactions,
  dashToDuffs,
  duffsToDash,
  extendTransactionsWithMetadata,
  generateNewMnemonic,
  mnemonicToHDPrivateKey,
  mnemonicToWalletId,
  mnemonicToSeed,
  seedToHDPrivateKey,
  is,
  coinSelection,
  feeCalculation,
  filterTransactions,
  varIntSizeBytesFromLength,
  getBytesOf,
  hash,
  doubleSha256,
  sha256,
  hasProp,
  hasMethod,
  fundWallet,
};
