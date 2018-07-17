const Dashcore = require('@dashevo/dashcore-lib');
const { EventEmitter } = require('events');
const { BIP44_LIVENET_ROOT_PATH, BIP44_TESTNET_ROOT_PATH } = require('./Constants');
const { is } = require('./utils');

class Account {
  constructor(wallet, opts = {}) {
    this.events = new EventEmitter();

    if (!wallet || wallet.constructor.name !== 'Wallet') throw new Error('Expected wallet to be created and passed as param');

    const accountIndex = (opts.accountIndex) ? opts.accountIndex : wallet.accounts.length;
    this.accountIndex = accountIndex;

    this.BIP44PATH = (wallet.network === Dashcore.Networks.livenet)
      ? `${BIP44_LIVENET_ROOT_PATH}/${accountIndex}'`
      : `${BIP44_TESTNET_ROOT_PATH}/${accountIndex}'`;

    this.RootHDPrivateKey = wallet.HDPrivateKey;

    this.addresses = {
      external: {}, // receive addr
      internal: {}, // change addr
    };
    this.label = (opts && opts.label && is.string(opts.label)) ? opts.label : null;

    this.adapter = wallet.adapter;
    this.transport = wallet.transport;

    const self = this;

    const existAlready = wallet.accounts.filter(function(el){
      return el.accountIndex === self.accountIndex;
    }).length > 0;
    if(!existAlready) {
      wallet.accounts.push(this);
    }else {
      console.warn('trying to recreate', self.accountIndex)
    }


    // As per BIP44, we ideally should continue the discovery based on used/unused
    // this.generateMultipleAddressPair(20);
  }

  /**
   * @return {Array<object>} - list of unspent outputs for the wallet
   */
  async getUTXO(amount) {
    throw new Error('Not Implemented');
  }

  getAddresses(external = true) {
    const type = (external) ? 'external' : 'internal';
    return this.addresses[type];
  }

  getAddress(index = 0, external = true) {
    const type = (external) ? 'external' : 'internal';
    const path = (external) ? `${this.BIP44PATH}/0/${index}` : `${this.BIP44PATH}/1/${index}`;
    const addressType = this.addresses[type];
    return (addressType[path]) ? addressType[path] : this.generateAddress(path);
  }

  generateAddress(path) {
    if (!path) throw new Error('Expected path to generate an address');
    const index = path.split('/')[5];
    const type = (path.split('/')[4] === '0') ? 'external' : 'internal';

    const privateKey = this.RootHDPrivateKey.derive(path);
    const address = new Dashcore.Address(privateKey.publicKey).toString();
    const addressData = {
      path,
      index,
      address,
      privateKey,
      transactions: [],
      balance: 0,
      utxos: [],
      fetchedTimes: 0,
    };
    this.addresses[type][path] = addressData;
    return addressData;
  }

  // createTransaction() {
  //   const tx = new Dashcore.Transaction();
  //   return tx;
  // }

  // signTransaction(transaction = null) {
  //   transaction.sign(null);
  //   return true;
  // }

  // selectUTXO() {
  //   return true;
  // }

  // broadcastTransaction() {
  //
  // }

  // updateAddressData() {
  //   const id = 1;
  //   const path = `${this.BIP44PATH}${id}`;
  //   const balance = 0;
  //   const addr = 'addr';
  //   const transactions = [];
  //   const utxos = [];
  //   return {
  //     path,
  //     addr,
  //     balance,
  //     transactions,
  //     utxos,
  //   };
  // }

  // /**
  //  * Broadcasts transaction to the network
  //  * @param {string} rawTransaction
  //  */
  // sendTransaction(rawTransaction) {
  //   return this.DAPIClient.sendRawTransaction(rawTransaction);
  // }


  // /**
  //  * Signs transaction
  //  * @param {string} rawTx - hex string representing transaction to sign
  //  * @return {string} - hex string representing signed transaction
  //  */
  // signTransaction(rawTx) {
  //   const tx = new Transaction(rawTx);
  //   tx.sign(this.getPrivateKeyForSigning());
  //   return tx.serialize();
  // }

  /*
 * Evo L1 stuff
 */

  // /**
  //  * @param {string} username
  //  * @returns {string} - hex string containing user registration
  //  */
  // createRegistration(username) {
  //   const privateKey = new PrivateKey(this.keychain.getNewPrivateKey());
  //   return Registration.createRegistration(username, privateKey).serialize();
  // }
  //
  // /**
  //  * @param {string} rawRegistration - hex string representing user registration data
  //  * @param {number} [funding] - default funding for the account in duffs. Optional. If left empty,
  //  * funding will be 0.
  //  * @return {string} - user id
  //  */
  // async registerUser(rawRegistration, funding = 0) {
  //   const regTx = new Registration(rawRegistration);
  //   const UTXO = await this.getUTXO();
  //   regTx.fund(UTXO, this.getNewAddress(), funding);
  //   const signedTx = this.signTransaction(regTx.serialize());
  //   return this.sendTransaction(signedTx);
  // }
  //
  // /**
  //  * @param {string} userId
  //  * @param {number} amount - top up amount in duffs
  //  * @return {Promise<string>} - tx id
  //  */
  // async topUpUserCredits(userId, amount) {
  //   const inputs = await this.getUTXO();
  //   const subTx = new TopUp();
  //   subTx.fund(userId, amount, inputs, this.getNewAddress());
  //   const signedTx = this.signTransaction(subTx.serialize());
  //   return this.sendTransaction(signedTx);
  // }
  //
  // async signStateTransitionHeader(rawHeader) {
  //   const ts = new Transaction(rawHeader);
  //   ts.sign(this.getPrivateKeyForSigning());
  //   return ts.serialize();
  // }
}

module.exports = Account;
