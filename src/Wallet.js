const DashcoreLib = require('@dashevo/dashcore-lib');
const Mnemonic = require('@dashevo/dashcore-mnemonic');
const { EventEmitter } = require('events');

// const { Registration, TopUp } = DashcoreLib.Transaction.SubscriptionTransactions;
const {
  generateNewMnemonic,
  mnemonicToSeed,
  HDPrivateKeyToMnemonic,
  is,
} = require('./utils');

const { Transaction, PrivateKey } = DashcoreLib;
const Account = require('./Account');

const defaultOptions = {
  network: 'testnet',
};

/**
 * Instantiate a basic Wallet object,
 * A wallet is able to spawn up all preliminary steps toward the creation of a Account with
 * it's own transactions
 */
class Wallet {
  /**
   *
   * @param config
   */
  constructor(opts = defaultOptions) {
    let HDPrivateKey,
      passphrase,
      mnemonic = null;

    if (!(opts.network && is.network(opts.network))) throw new Error('Expected a valid network (typeof Network or String');
    this.network = DashcoreLib.Networks[opts.network];
    if (opts.passphrase) passphrase = opts.passphrase;

    if (opts.mnemonic) {
      if (!is.mnemonic(opts.mnemonic)) throw new Error('Expected a valid mnemonic (typeof String or Mnemonic)');
      mnemonic = opts.mnemonic;
      HDPrivateKey = mnemonicToSeed(opts.mnemonic, this.network, passphrase);
    } else if (opts.seed) {
      if (!is.seed(opts.seed)) throw new Error('Expected a valid seed (typeof HDPrivateKey or String');
      HDPrivateKey = opts.seed;
      mnemonic = null; // todo : verify if possible to change from HDPrivateKey to Mnemonic back
    } else {
      console.warn('No seed nor mnemonic provided, generating a new one');
      mnemonic = generateNewMnemonic();
      HDPrivateKey = mnemonicToSeed(mnemonic, this.network, passphrase);
    }

    this.adapter = (opts.adapter) ? opts.adapter : null;
    // If transport is null, we won't try to fetch anything
    this.transport = (opts.transport) ? opts.transport : null;

    this.accounts = [];
    this.HDPrivateKey = HDPrivateKey;
    this.mnemonic = mnemonic; // We keep it only for the export function..
    this.interface = opts.interface;
    this.savedBackup = false; // When true, we delete mnemonic from internals
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

  getAccount(accountIndex = 0) {
    const acc = this.accounts.filter(el => el.accountIndex === accountIndex);
    return (acc[0]) || this.createAccount({ accountIndex });
  }

  exportWallet(toHDPrivateKey = false) {
    function exportMnemonic(mnemonic) {
      if (mnemonic === null) throw new Error('Wallet was not initiated with a mnemonic, can\'t export it');
      return mnemonic.toString();
    }
    return (toHDPrivateKey) ? this.HDPrivateKey : exportMnemonic(this.mnemonic);
  }
}

module.exports = Wallet;
