const Wallet = require('./types/Wallet/methods/Wallet');
const Account = require('./types/Account/Account');
const EVENTS = require('./EVENTS');
const CONSTANTS = require('./CONSTANTS');
const utils = require('./utils');
const plugins = require('./plugins');

module.exports = {
  Wallet,
  Account,
  EVENTS,
  CONSTANTS,
  utils,
  plugins,
};
