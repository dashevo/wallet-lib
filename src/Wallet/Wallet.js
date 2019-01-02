const Dashcore = require('@dashevo/dashcore-lib');
const _ = require('lodash');
const localforage = require('localforage');
const InMem = require('../adapters/InMem');
const Storage = require('../Storage');
const KeyChain = require('../KeyChain');
// const { Registration, TopUp } = Dashcore.Transaction.SubscriptionTransactions;
const {
  generateNewMnemonic,
  mnemonicToHDPrivateKey,
  mnemonicToWalletId,
  is,
} = require('../utils/index');

const Account = require('../Account/Account');
const Transporter = require('../transports/Transporter');

const defaultOptions = {
  network: 'testnet',
  plugins: [],
  passphrase: null,
  injectDefaultPlugins: true,
  allowSensitiveOperations: false,
};

const createAccount = require('./createAccount');
const disconnect = require('./disconnect');
const exportWallet = require('./exportWallet');
const fromMnemonic = require('./fromMnemonic');
const fromPrivateKey = require('./fromPrivateKey');
const fromSeed = require('./fromSeed');
const generateNewWalletId = require('./generateNewWalletId');
const getAccount = require('./getAccount');
const updateNetwork = require('./updateNetwork');

/**
 * Instantiate a basic Wallet object,
 * A wallet is able to spawn up all preliminary steps toward the creation of a Account with
 * it's own transactions
 *
 * A wallet can be of multiple types, which some method.
 * Type are attributed in function of opts (mnemonic, seed,...)
 *
 * WALLET_TYPES :
 *     - address : opts.privateKey is provided. Allow to handle a single address object.
 *     - hdwallet : opts.mnemonic or opts.seed is provided. Handle a HD Wallet with it's account.
 */
class Wallet {
  /**
   *
   * @param opts
   */
  constructor(opts = defaultOptions) {
    Object.assign(Wallet.prototype, {
      createAccount,
      disconnect,
      getAccount,
      fromMnemonic,
      fromSeed,
      fromPrivateKey,
      generateNewWalletId,
      updateNetwork,
      exportWallet,
    });

    const network = _.has(opts, 'network') ? opts.network : defaultOptions.network;
    const passphrase = _.has(opts, 'passphrase') ? opts.passphrase : defaultOptions.passphrase;
    this.passphrase = passphrase;

    this.allowSensitiveOperations = _.has(opts, 'allowSensitiveOperations') ? opts.allowSensitiveOperations : defaultOptions.allowSensitiveOperations;
    this.injectDefaultPlugins = _.has(opts, 'injectDefaultPlugins') ? opts.injectDefaultPlugins : defaultOptions.injectDefaultPlugins;

    if (!(is.network(network))) throw new Error('Expected a valid network (typeof Network or String)');
    this.network = Dashcore.Networks[network];

    if ('mnemonic' in opts) {
      this.fromMnemonic(opts.mnemonic);
    } else if ('seed' in opts) {
      this.fromSeed(opts.seed);
    } else if ('privateKey' in opts) {
      this.fromPrivateKey(opts.privateKey);
    } else {
      this.fromMnemonic(generateNewMnemonic());
    }

    // Notice : Most of the time, wallet id is deterministic
    this.generateNewWalletId();

    this.storage = new Storage({
      adapter: opts.adapter,
      walletId: this.walletId,
      network: this.network,
      mnemonic: this.mnemonic,
      type: this.type,
    });
    this.store = this.storage.store;
    const plugins = opts.plugins || defaultOptions.plugins;
    this.plugins = {};
    // eslint-disable-next-line no-return-assign
    plugins.map(item => this.plugins[item.name] = item);

    // Handle import of cache
    if (opts.cache) {
      if (opts.cache.transactions) {
        this.storage.importTransactions(opts.cache.transactions);
      }
      if (opts.cache.addresses) {
        this.storage.importAddresses(opts.cache.addresses, this.walletId);
      }
    }

    this.transport = (opts.transport) ? new Transporter(opts.transport) : new Transporter();
    this.accounts = [];
    this.interface = opts.interface;
    this.savedBackup = false; // When true, we delete mnemonic from internals
  }
}

module.exports = Wallet;