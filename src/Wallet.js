const DashcoreLib = require('@dashevo/dashcore-lib');
const Mnemonic = require('@dashevo/dashcore-mnemonic');
const { EventEmitter } = require('events');

const { Registration, TopUp } = DashcoreLib.Transaction.SubscriptionTransactions;
const { generateNewMnemonic, mnemonicToSeed, is } = require('./utils');

const { Transaction, PrivateKey } = DashcoreLib;
const Account = require('./Account');

const defaultConfig = {
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
  constructor(config = defaultConfig) {
    let HDPrivateKey = null;

    if (!(config.network && is.network(config.network))) throw new Error('Expected a valid network (typeof Network or String');
    this.network = DashcoreLib.Networks[config.network];

    if (config.mnemonic) {
      if (!is.mnemonic(config.mnemonic)) throw new Error('Expected a valid mnemonic (typeof String or Mnemonic)');
      HDPrivateKey = mnemonicToSeed(config.mnemonic,  this.network);
    } else if (config.seed) {
      if (!is.seed(config.seed)) throw new Error('Expected a valid seed (typeof HDPrivateKey or String');
      HDPrivateKey = config.seed;
    } else {
      console.warn('No seed nor mnemonic provided, generating a new one');
      HDPrivateKey = mnemonicToSeed(generateNewMnemonic(),  this.network);
    }

    this.adapter = (config.adapter) ? config.adapter : null;
    this.transport = (config.transport) ? config.transport : null;

    this.accounts = [];
    this.HDPrivateKey = HDPrivateKey;
    this.interface = config.interface;
    this.synced = false;
    this.events = new EventEmitter();
    this.eventConstants = {
      synced: 'synced',
    };

    // this.synchronize();
  }

  /**
   * Will derivate to a new account.
   * @return {account} - account object
   */
  createAccount() {
    // Auto-populate this.accounts, probably not what we want ?
    return new Account(this);
  }
}

module.exports = Wallet;
