const Dashcore = require('@dashevo/dashcore-lib');
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
const SingleAddress = require('./SingleAddress');
const Transporter = require('./transports/Transporter');

const defaultOptions = {
  network: 'testnet',
};
const TYPES = {
  'SINGLE_ADDRESS':'single_address',
  "HDWALLET":'hdwallet'
};


/**
 * Instantiate a basic Wallet object,
 * A wallet is able to spawn up all preliminary steps toward the creation of a Account with
 * it's own transactions
 *
 * A wallet can be of multiple types, which some method. Type are attributed in function of opts (mnemonic, seed,...)
 *
 * Types :
 *     - address : opts.privateKey is provided. Allow to handle a single address object.
 *     - hdwallet : opts.mnemonic or opts.seed is provided. Handle a HD Wallet with it's account.
 */
class Wallet {
  /**
   *
   * @param opts
   */
  constructor(opts = defaultOptions) {
    if (!(opts.network && is.network(opts.network))) throw new Error('Expected a valid network (typeof Network or String)');
    this.passphrase = (opts.passphrase) ? (opts.passphrase) : null;
    this.network = Dashcore.Networks[opts.network];

    if ('mnemonic' in opts) {
      this.fromMnemonic(opts.mnemonic);
    } else if ('seed' in opts) {
      this.fromSeed(opts.seed);
    } else if ('privateKey' in opts) {
      this.fromPrivateKey(opts.privateKey);
    } else {
      this.fromMnemonic(generateNewMnemonic());
    }

    //Notice : Most of the time, wallet id is deterministic
    this.generateNewWalletId();

    this.adapter = (opts.adapter) ? opts.adapter : new InMem();
    this.adapter.config();

    this.storage = new Storage({
      adapter: this.adapter,
      walletId: this.walletId,
      network: this.network,
      mnemonic:this.mnemonic,
      type:this.type
    });
    this.store = this.storage.store;

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
  generateNewWalletId(){
    const type = this.type;
    switch (type) {
      case TYPES.SINGLE_ADDRESS:
        this.walletId =  mnemonicToWalletId(this.privateKey);
        break;
      case TYPES.HDWALLET:
      default:
        if(!this.HDPrivateKey) throw new Error('Cannot generate a walletId : Do not find any HDPrivateKey');
        this.walletId = mnemonicToWalletId(this.HDPrivateKey);
        break;
    }

  }
  fromPrivateKey(privateKey){
    if (!is.privateKey(privateKey)) throw new Error('Expected a valid private key (typeof PrivateKey or String)');
    this.type = TYPES.SINGLE_ADDRESS;
    this.mnemonic = null;
    this.privateKey = privateKey;
    this.keychain = new KeyChain({privateKey:privateKey});

  }
  fromSeed(seed){
    if (!is.seed(seed)) throw new Error('Expected a valid seed (typeof HDPrivateKey or String)');
    this.type = TYPES.HDWALLET;
    this.mnemonic = null;
    this.HDPrivateKey = seed;
    this.keychain = new KeyChain({HDRootKey:seed});
  }
  fromMnemonic(mnemonic){
    if (!is.mnemonic(mnemonic)) {
      throw new Error('Expected a valid mnemonic (typeof String or Mnemonic)');
    }
    const trimmedMnemonic = mnemonic.toString().trim();
    this.type = TYPES.HDWALLET;
    this.mnemonic = trimmedMnemonic; // todo : What about without this ?
    this.HDPrivateKey=mnemonicToHDPrivateKey(trimmedMnemonic, this.network, this.passphrase);
    this.keychain = new KeyChain({HDRootKey:this.HDPrivateKey});
  }
  // TODO : Add tests
  updateNetwork(network) {
    if (is.network(network) && network !== this.network) {
      this.network = Dashcore.Networks[network];
      this.transport.updateNetwork(network);
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
    return new Account(this, accountOpts);
  }

  /**
   *
   */
  createSingleAddress(singleAddressOpts){
    return new SingleAddress(this, singleAddressOpts);
  }
  /**
   * Get a specific account per accountIndex
   * @param accountIndex - Default: 0, set a specific index to get
   * @param accountOpts - If we can't get, we create passing these arg to createAccount method
   * @return {*|account}
   */
  getAccount(accountIndex = 0, accountOpts) {
    if(this.type===TYPES.SINGLE_ADDRESS){
      return this.createSingleAddress({privateKey:this.privateKey});
    }
    const acc = this.accounts.filter(el => el.accountIndex === accountIndex);
    const opts = Object.assign({ accountIndex }, accountOpts);
    return (acc[0]) || this.createAccount(opts);
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

    if(toHDPrivateKey){
      return this.HDPrivateKey;
    }
    switch (this.type) {
      case TYPES.SINGLE_ADDRESS:
        if(!this.privateKey) throw new Error('Nothing to export');
        return this.privateKey;
        break;
      case TYPES.HDWALLET:
        return exportMnemonic(this.mnemonic)
        break;
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
