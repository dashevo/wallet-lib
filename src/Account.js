const Dashcore = require('@dashevo/dashcore-lib');
const { EventEmitter } = require('events');
const { BIP44_LIVENET_ROOT_PATH, BIP44_TESTNET_ROOT_PATH, BIP44_ADDRESS_GAP } = require('./Constants');
const { feeCalculation, is, dashToDuffs } = require('./utils/');

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
      function parseUTXO(utxos) {
        return utxos.filter((utxo) => {
          const utxoRes = utxo;
          delete utxoRes.confirmations;
          return utxoRes;
        });
      }
      const utxo = (balance > 0) ? parseUTXO(await self.transport.getUTXO(address)) : [];

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

  getUnusedAddress(external = true, skip = 0) {
    const type = (external) ? 'external' : 'internal';
    let unused = null;
    let skipped = 0;
    const keys = Object.keys(this.addresses[type]);
    // eslint-disable-next-line array-callback-return
    keys.some((key) => {
      const el = (this.addresses[type][key]);
      if (!el.used) {
        if (skipped === skip) {
          unused = el;
        }
        skipped += 1;
      }
    });

    return unused;
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

  /**
   * Return the total balance of an account.
   * Ezpect paralel fetching/discovery to be activated.
   * @return {number} Balance in duffs
   */
  getBalance() {
    let balance = 0;
    Object.keys(this.addresses.external).forEach((key) => {
      balance += this.addresses.external[key].balance;
    });
    Object.keys(this.addresses.internal).forEach((key) => {
      balance += this.addresses.internal[key].balance;
    });
    return balance;
  }

  getUTXOS(onlyAvailable = true) {
    let utxos = [];

    const self = this;
    const subwallets = Object.keys(this.addresses);
    subwallets.forEach((subwallet) => {
      const paths = Object.keys(self.addresses[subwallet]);
      paths.forEach((path) => {
        const address = self.addresses[subwallet][path];
        if (address.utxos) {
          if (!(onlyAvailable && address.locked)) {
            const utxo = address.utxos;
            utxos = utxos.concat(utxo);
          }
        }
      });
    });

    return utxos;
  }

  createTransaction(opts) {
    if (!opts || (!opts.amount && !opts.satoshis)) {
      throw new Error('An amount in dash or in satoshis is expected to create a transaction');
    }
    if (!opts || (!opts.to)) {
      throw new Error('A recipient is expected to create a transaction');
    }
    const utxos = this.getUTXOS();
    const inputs = [utxos[0]];
    const tx = new Dashcore.Transaction();
    tx.from(inputs);

    const satoshis = (opts.amount && !opts.satoshis) ? dashToDuffs(opts.amount) : opts.satoshis;
    // console.log(opts);

    const outputs = [{ address: opts.to, satoshis }];
    tx.to(outputs);

    const addressChange = this.getUnusedAddress(false, 1).address;
    tx.change(addressChange);

    const feeRate = (opts.isInstantSend) ? feeCalculation('instantSend') : feeCalculation();
    if (feeRate.type === 'perBytes') {
      tx.feePerKb(feeRate.value / 100);
    }
    if (feeRate.type === 'perInputs') {
      const fee = inputs.length * feeRate.value;
      tx.fee(fee);
    }


    const privateKeys = this.getPrivateKeys(utxos.map(el => ((el.address))));

    tx.sign(privateKeys, Dashcore.crypto.Signature.SIGHASH_ALL);

    if (!tx.isFullySigned()) {
      throw new Error('Not fully signed transaction');
    }
    return tx.toString();
  }

  getPrivateKeys(addressList) {
    let privKeys = [];

    const self = this;
    const subwallets = Object.keys(this.addresses);
    subwallets.forEach((subwallet) => {
      const paths = Object.keys(self.addresses[subwallet]);
      paths.forEach((path) => {
        const address = self.addresses[subwallet][path];
        if (addressList.includes(address.address)) {
          privKeys = privKeys.concat([address.privateKey.privateKey]);
        }
      });
    });

    return privKeys;
  }

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
