const Dashcore = require('@dashevo/dashcore-lib');
const _ = require('lodash');
const InMem = require('./adapters/InMem');
const Storage = require('./Storage');
const KeyChain = require('./KeyChain');
// const { Registration, TopUp } = Dashcore.Transaction.SubscriptionTransactions;
const {
  generateNewMnemonic,
  mnemonicToHDPrivateKey,
  mnemonicToWalletId,
  is,
} = require('./utils/index');

const Account = require('./Account');
const Transporter = require('./transports/Transporter');

const defaultOptions = {
  network: 'testnet',
  plugins: [],
  passphrase: null,
  injectDefaultPlugins: true,
  forceUnsafePlugins: false,
};
const { WALLET_TYPES } = require('./CONSTANTS');


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
    const network = _.has(opts, 'network') ? opts.network : defaultOptions.network;
    const passphrase = _.has(opts, 'passphrase') ? opts.passphrase : defaultOptions.passphrase;
    this.passphrase = passphrase;

    this.forceUnsafePlugins = _.has(opts, 'forceUnsafePlugins') ? opts.forceUnsafePlugins : defaultOptions.forceUnsafePlugins;
    this.injectDefaultPlugins = _.has(opts, 'injectDefaultPlugins') ? opts.injectDefaultPlugins : defaultOptions.injectDefaultPlugins;
    this.injectPluginsList = opts.plugins || [];

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
    this.adapter = (opts.adapter) ? opts.adapter : new InMem();
    if(this.adapter.config) this.adapter.config();
    this.storage = new Storage({
      adapter: this.adapter,
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

  generateNewWalletId() {
    const { type } = this;
    switch (type) {
      case WALLET_TYPES.SINGLE_ADDRESS:
        this.walletId = mnemonicToWalletId(this.privateKey);
        break;
      case WALLET_TYPES.HDWALLET:
      default:
        if (!this.HDPrivateKey) throw new Error('Cannot generate a walletId : Do not find any HDPrivateKey');
        this.walletId = mnemonicToWalletId(this.HDPrivateKey);
        break;
    }
  }

  fromPrivateKey(privateKey) {
    if (!is.privateKey(privateKey)) throw new Error('Expected a valid private key (typeof PrivateKey or String)');
    this.type = WALLET_TYPES.SINGLE_ADDRESS;
    this.mnemonic = null;
    this.privateKey = privateKey;
    this.keyChain = new KeyChain({ privateKey });
  }

  fromSeed(seed) {
    if (!is.seed(seed)) throw new Error('Expected a valid seed (typeof HDPrivateKey or String)');
    this.type = WALLET_TYPES.HDWALLET;
    this.mnemonic = null;
    this.HDPrivateKey = seed;
    this.keyChain = new KeyChain({ HDRootKey: seed });
  }

  fromMnemonic(mnemonic) {
    if (!is.mnemonic(mnemonic)) {
      throw new Error('Expected a valid mnemonic (typeof String or Mnemonic)');
    }
    const trimmedMnemonic = mnemonic.toString().trim();
    this.type = WALLET_TYPES.HDWALLET;
    this.mnemonic = trimmedMnemonic; // todo : What about without this ?
    this.HDPrivateKey = mnemonicToHDPrivateKey(trimmedMnemonic, this.network, this.passphrase);
    this.keyChain = new KeyChain({ HDRootKey: this.HDPrivateKey });
  }

  // TODO : Add tests
  updateNetwork(network) {
    if (is.network(network) && network !== this.network) {
      this.network = Dashcore.Networks[network];
      // this.transport.updateNetwork(network);
      this.accounts.forEach((acc) => {
        acc.updateNetwork(network);
      });
      return true;
    }
    return false;
  }

  /**
   * Will derivate to a new account.
   * @param {object} account options
   * @return {account} - account object
   */
  createAccount(accountOpts) {
    // if(this.accounts[])
    // Auto-populate this.accounts, probably not what we want ?
    if (this.injectDefaultPlugins === false && !_.has(accountOpts, 'injectDefaultPlugins')) {
    // eslint-disable-next-line
      accountOpts.injectDefaultPlugins = this.injectDefaultPlugins;
    }
    if (this.forceUnsafePlugins === true && !_.has(accountOpts, 'forceUnsafePlugins')) {
    // eslint-disable-next-line
      accountOpts.forceUnsafePlugins = this.forceUnsafePlugins;
    }
    return new Account(this, accountOpts);
  }


  /**
   * Get a specific account per accountIndex
   * @param accountIndex - Default: 0, set a specific index to get
   * @param accountOpts - If we can't get, we create passing these arg to createAccount method
   * @return {*|account}
   */
  getAccount(accountIndex = 0, accountOpts) {
    const { injectDefaultPlugins } = this;
    const plugins = this.injectPluginsList;
    const acc = this.accounts.filter(el => el.accountIndex === accountIndex);
    const baseOpts = { accountIndex, injectDefaultPlugins, plugins };
    if (this.type === WALLET_TYPES.SINGLE_ADDRESS) { baseOpts.privateKey = this.privateKey; }

    const opts = Object.assign(baseOpts, accountOpts);
    const account = (acc[0]) || this.createAccount(opts);
    this.storage.events = account.events;
    return account;
  }

  /**
   * Export the wallet (mnemonic)
   * @param toHDPrivateKey - Default: false - Allow to return to a HDPrivateKey type
   * @return {Mnemonic|HDPrivateKey}
   */
  exportWallet(toHDPrivateKey = false) {
    function exportMnemonic(mnemonic) {
      if (mnemonic === null) throw new Error('Wallet was not initiated with a mnemonic, can\'t export it');
      return mnemonic.toString();
    }

    if (toHDPrivateKey) {
      return this.HDPrivateKey;
    }
    switch (this.type) {
      case WALLET_TYPES.SINGLE_ADDRESS:
        if (!this.privateKey) throw new Error('Nothing to export');
        return this.privateKey;
      case WALLET_TYPES.HDWALLET:
        return exportMnemonic(this.mnemonic);
      default:
        throw new Error('Nothing to export');
    }
  }

  /**
   * Disconnect all the storage worker and process all account to disconnect their endpoint too.
   */
  disconnect() {
    if (this.storage) {
      this.storage.stopWorker();
    }
    if (this.accounts) {
      const accountPath = Object.keys(this.accounts);
      accountPath.forEach((path) => {
        this.accounts[path].disconnect();
      });
    }
  }
}

module.exports = Wallet;
