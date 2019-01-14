const WalletLibError = require('./WalletLibError');
const UnknownPlugin = require('./UnknownPlugin');
const InjectionToPluginUnallowed = require('./InjectionToPluginUnallowed');
const UnknownDAP = require('./UnknownDAP');
const InjectionErrorCannotInject = require('./InjectionErrorCannotInject');
const InjectionErrorCannotInjectUnknownDependency = require('./InjectionErrorCannotInjectUnknownDependency');
const ValidTransportLayerRequired = require('./ValidTransportLayerRequired');
const TransactionNotInStore = require('./TransactionNotInStore');
const InvalidAddressObject = require('./InvalidAddressObject');
const InvalidTransaction = require('./InvalidTransaction');
const InvalidRawTransaction = require('./InvalidRawTransaction');
const InvalidUTXO = require('./InvalidUTXO');
const InvalidOutput = require('./InvalidOutput');
const CreateTransactionError = require('./CreateTransactionError');
const CoinSelectionUnsufficientUTXOS = require('./CoinSelectionUnsufficientUTXOS');


module.exports = {
  WalletLibError,
  UnknownPlugin,
  InjectionToPluginUnallowed,
  UnknownDAP,
  InjectionErrorCannotInject,
  InjectionErrorCannotInjectUnknownDependency,
  ValidTransportLayerRequired,
  TransactionNotInStore,
  InvalidAddressObject,
  InvalidTransaction,
  InvalidRawTransaction,
  InvalidUTXO,
  InvalidOutput,
  CreateTransactionError,
  CoinSelectionUnsufficientUTXOS,
};
