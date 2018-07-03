const Mnemonic = require('@dashevo/dashcore-mnemonic');
const Dashcore = require('@dashevo/dashcore-lib');
const { EventEmitter } = require('events');
const KeyChain = require('./KeyChain');
const BloomFilter = require('bloom-filter');

const { Registration, TopUp } = Dashcore.Transaction.SubscriptionTransactions;
const { Transaction, PrivateKey, HDPrivateKey } = Dashcore;

const EVENT_CONSTANTS = {
  SYNCED: 'SYNCED',
};

/**
 * Returns a new wallet object.
 * @param {DAPIClient} DAPIClient
 * @param {string|privateHDKey} seed
 * @param {string} network
 * @return {Wallet} - new wallet object
 */
const createWallet = (DAPIClient, seed, network = 'livenet') => {
  const privateHDKey = (seed.constructor.name === 'HDPrivateKey')
    ? seed
    : new HDPrivateKey.fromSeed(new Mnemonic(seed).toSeed(), network);

  return {
    DAPIClient,
    events: new EventEmitter(),
    privateHDKey,
    synced: false,
    network,
  };
};

/**
 * Returns a new synchronized wallet object.
 * @param {Wallet} wallet
 * @return {Wallet} - newly synchronized wallet object
 */
const syncWallet = (wallet) => {
  wallet.events.emit(EVENT_CONSTANTS.SYNCED);
  return Object.assign(wallet, { synced: true });
};

// TODO: Do we need this, or can we export KeyChain as a separate bundled library?
const getPrivateKeyForSigning = wallet => KeyChain.getNewPrivateKey(wallet.privateHDKey);

/**
 * @param {Wallet} wallet
 * @return {Array<object>} - TODO
 */
const getBloomFilter = (privKeys, fpRate) => {
  const filter = BloomFilter.create(privKeys.length, fpRate, 0, BloomFilter.BLOOM_UPDATE_ALL)

  privKeys.forEach(key => {
    filter.insert(new Dashcore.PrivateKey(key).toPublicKey())
  })

  return filter;
}

/**
 * @param {Wallet} wallet
 * @return {Array<object>} - list of unspent outputs for the wallet
 */
const getUTXO = async (wallet) => { throw new Error('Not Implemented'); };

/**
 * @param {Wallet} wallet
 * @param {object} options of the transaction
 * @returns {string} - rawTx
 */
const createTransaction = (wallet, opts) => {

  const transaction = new Transaction()
    .from(opts.utxos)
    .to(opts.to, opts.amount)
    .feePerKb(opts.fee)
    .change(opts.change)

  return transaction.toString();
};

/**
 * @param {Wallet} wallet
 * @return {string} - new change address
 */
const getNewAddress = (wallet) => {
  if (wallet.privateHDKey) {
    const newKey = KeyChain.getNewPrivateKey(wallet.privateHDKey);
    return String(newKey.toAddress());
  }
  const newKey = KeyChain.getNewPrivateKey(wallet);
  return String(newKey.toAddress());
};

/**
 * Broadcasts transaction to the network.
 * @param {Wallet} wallet
 * @param {string} rawTransaction
 */
const sendTransaction = (wallet, rawTransaction) => wallet.DAPIClient
  .sendRawTransaction(rawTransaction);

/**
 * Signs transaction.
 * @param {Wallet} wallet
 * @param {string} rawTx - hex string representing transaction to sign
 * @return {string} - hex string representing signed transaction
 */
const signTransaction = (wallet, rawTransaction) => {
  const privateKeyForSigning = getPrivateKeyForSigning(wallet);
  const tx = new Transaction(rawTransaction);
  tx.sign(privateKeyForSigning);
  return tx.serialize();
};

/*
 * Evo L1 stuff
 */

/**
 * @param {Wallet} wallet
 * @param {string} username
 * @returns {string} - hex string containing user registration
 */
const createRegistration = (wallet, username) => {
  const privateKey = new PrivateKey(wallet.keychain.getNewPrivateKey());
  return Registration.createRegistration(username, privateKey).serialize();
};

/**
 * @param {Wallet} wallet
 * @param {string} rawRegistration - hex string representing user registration data
 * @param {number} [funding] - default funding for the account in duffs. Optional. If left empty,
 * funding will be 0.
 * @return {string} - user id
 */
const registerUser = async (wallet, rawRegistration, funding = 0) => {
  const regTx = new Registration(rawRegistration);
  const UTXO = await this.getUTXO();
  const newAddress = getNewAddress(wallet);
  regTx.fund(UTXO, newAddress, funding);
  const serializedRegTx = regTx.serialize();
  const signedTx = signTransaction(wallet, serializedRegTx);
  return this.sendTransaction(signedTx);
};

/**
 * @param {Wallet} wallet
 * @param {string} userId
 * @param {number} amount - top up amount in duffs
 * @return {Promise<string>} - tx id
 */
const topUpUserCredits = async (wallet, userId, amount) => {
  const inputs = await getUTXO(wallet);
  const subTx = new TopUp();
  const newAddress = getNewAddress(wallet);
  subTx.fund(userId, amount, inputs, newAddress);
  const signedTx = this.signTransaction(subTx.serialize());
  return this.sendTransaction(signedTx);
};

/**
 * @param {Wallet} wallet
 * @param rawHeader
 * @returns {Promise<string>}
 */
const signStateTransitionHeader = async (wallet, rawHeader) => {
  const privateKeyForSigning = getPrivateKeyForSigning(wallet);
  const ts = new Transaction(rawHeader);
  ts.sign(privateKeyForSigning);
  return ts.serialize();
};

module.exports = {
  createWallet,
  syncWallet,
  getPrivateKeyForSigning,
  getUTXO,
  getNewAddress,
  sendTransaction,
  signTransaction,
  createRegistration,
  createTransaction,
  registerUser,
  topUpUserCredits,
  signStateTransitionHeader,
};
