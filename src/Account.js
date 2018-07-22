const Dashcore = require('@dashevo/dashcore-lib');
const { EventEmitter } = require('events');
const { BIP44_LIVENET_ROOT_PATH, BIP44_TESTNET_ROOT_PATH, BIP44_ADDRESS_GAP } = require('./Constants');
const { is } = require('./utils');

const defaultOptions = {
  mode: 'full',
};
class Account {
  constructor(wallet, opts = defaultOptions) {
    this.events = new EventEmitter();

    if (!wallet || wallet.constructor.name !== 'Wallet') throw new Error('Expected wallet to be created and passed as param');

    const accountIndex = (opts.accountIndex) ? opts.accountIndex : wallet.accounts.length;
    this.accountIndex = accountIndex;

    this.BIP44PATH = (wallet.network === Dashcore.Networks.livenet)
      ? `${BIP44_LIVENET_ROOT_PATH}/${accountIndex}'`
      : `${BIP44_TESTNET_ROOT_PATH}/${accountIndex}'`;

    this.network = wallet.network;
    this.RootHDPrivateKey = wallet.HDPrivateKey;
    this.addresses = {
      external: {}, // receive addr
      internal: {}, // change addr
    };
    this.label = (opts && opts.label && is.string(opts.label)) ? opts.label : null;

    this.adapter = wallet.adapter;
    // If transport is null or invalid, we won't try to fetch anything
    this.transport = wallet.transport;

    this.addAccountToWallet(wallet);

    this.synced = false;
    this.eventConstants = {
      synced: 'synced',
    };

    // As per BIP44, we prefetch 20 address
    if (opts && opts.mode === 'full') {
      this.prefetchFirstAddresses(20);
    }

    if (this.transport !== null) {
      this.startSynchronization();
    }
  }

  prefetchFirstAddresses(nbAddress = 20) {
    for (let index = 0; index < nbAddress; index += 1) {
      // External
      const externalPath = `${this.BIP44PATH}/0/${index}`;
      this.generateAddress(externalPath);

      // Internal
      const internalPath = `${this.BIP44PATH}/1/${index}`;
      this.generateAddress(internalPath);
    }
  }

  addAccountToWallet(wallet) {
    const self = this;
    const { accounts } = wallet;

    const existAlready = accounts.filter(el => el.accountIndex === self.accountIndex).length > 0;
    if (!existAlready) {
      wallet.accounts.push(this);
    }
  }

  /**
   * Start the process of synchronisation process if the transport layer is passed
   */
  startSynchronization() {
    // Start fetching address info using transport layer
    const self = this;
    this
      .fetchAddressesInfo()
      .then(() => {
        self.events.emit('prefetched');
      })

      .then(this.startSelfDiscoveryWorker.bind(this))
      .then(this.startAddressListener.bind(this))
      .then(this.startAddressBloomfilter.bind(this))
      .then(() => {
        self.events.emit('discovery_started');
      })
      .catch((err) => {
        throw new Error(err);
      });
  }

  async startAddressBloomfilter() {
    // TODO : Setup bloomfilter
    this.synced = true;
    return true;
  }

  async startAddressListener() {
    // TODO : Start Address listening
    this.synced = true;
    return true;
  }

  async startSelfDiscoveryWorker() {
    // TODO : We also should continue the discovery
    // based on used/unused (as per BIP44 always have 20+ addr)
    this.synced = true;
    return true;
  }

  async fetchAddressesInfo() {
    const self = this;
    async function fetcher(addressId, addressType = 'external') {
      const keys = Object.keys(self.addresses[addressType]);

      const { address, path } = self.addresses[addressType][keys[addressId]];
      const sum = await self.transport.getAddressSummary(address);
      const { balance, transactions } = sum;

      // We do not need to fetch UTXO if we don't have any money there :)
      const utxo = (balance > 0) ? await self.transport.getUTXO(address) : [];

      self.addresses[addressType][path].balance = balance;
      self.addresses[addressType][path].transactions = transactions;
      self.addresses[addressType][path].fetchedTimes += 1;
      self.addresses[addressType][path].utxos = utxo;

      if (transactions.length > 0) self.addresses[addressType][path].used = true;
    }
    async function processMultipleFetch(startValue, numberOfElements, addressType) {
      const tasks = [];
      for (let i = startValue; i < startValue + numberOfElements; i += 1) {
        tasks.push(() => fetcher(i, addressType));
      }
      const promises = tasks.map(task => task());
      await Promise.all(promises);
    }

    // Process in parallel the 20 first item (as per BIP44 GAP rules)
    await processMultipleFetch(0, BIP44_ADDRESS_GAP, 'external');
    await processMultipleFetch(0, BIP44_ADDRESS_GAP, 'internal');

    let unusedAddress = 0;

    Object.keys(self.addresses.external).forEach((k) => {
      const el = self.addresses.external[k];
      if (el.used === false) unusedAddress += 1;
    });

    if (BIP44_ADDRESS_GAP > unusedAddress) {
      const missingAddressNb = BIP44_ADDRESS_GAP - unusedAddress;
      const addressKeys = Object.keys(this.addresses.external);
      const lastElem = this.addresses.external[addressKeys[addressKeys.length - 1]];
      const addressIndex = parseInt(lastElem.index, 10);

      for (let i = addressIndex + 1; i < addressIndex + 1 + missingAddressNb; i += 1) {
        this.getAddress(i);
        this.getAddress(i, false);
      }
    }
  }
  /**
   * @return {Array<object>} - list of unspent outputs for the wallet
   */
  // async getUTXO(amount) {
  //   throw new Error('Not Implemented');
  // }

  // calculateFee(transaction) {
  //   const fee = 0;
  //   return transaction.fee(fee);
  // }

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
    const address = new Dashcore.Address(privateKey.publicKey, this.network).toString();
    const addressData = {
      path,
      index,
      address,
      privateKey,
      transactions: [],
      balance: 0,
      utxos: [],
      fetchedTimes: 0,
      used: false,
    };
    this.addresses[type][path] = addressData;
    return addressData;
  }

  createTransaction() {
    let tx = new Dashcore.Transaction();
    tx = this.calculateFee(tx);
    return tx;
  }

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
  //  * @param {number} [funding] - default funding for the account in duffs. Optional.
  // If left empty,
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
