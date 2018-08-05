const Dashcore = require('@dashevo/dashcore-lib');
const { EventEmitter } = require('events');
const { BIP44_LIVENET_ROOT_PATH, BIP44_TESTNET_ROOT_PATH, BIP44_ADDRESS_GAP } = require('./Constants');
const { feeCalculation, is, dashToDuffs } = require('./utils/');

const defaultOptions = {
  mode: 'full',
  cacheTx: true,
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

    this.mode = (opts.mode) ? opts.mode : defaultOptions.mode;
    this.cacheTx = (opts.cacheTx) ? opts.cacheTx : defaultOptions.cacheTx;
    this.transactions = {};

    // As per BIP44, we prefetch 20 address
    if (opts.mode === 'full') {
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
    self.events.emit('started');

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
      .then(() => {
        self.events.emit('ready');
      });
    // .catch((err) => {
    //   throw new Error(err);
    // });
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


  async broadcastTransaction(rawtx, isIs = false) {
    const txid = await this.transport.transport.sendRawTransaction(rawtx, isIs);
    return txid;
  }

  async fetchTransactionInfo(tx) {
    const self = this;
    const {
      txid, blockhash, blockheight, blocktime, fees, size, txlock, valueIn, valueOut, vin, vout,
    } = await self.transport.getTransaction(tx);

    this.transactions[txid] = {
      txid,
      blockhash,
      blockheight,
      blocktime,
      fees,
      size,
      txlock,
    };
  }

  async fetchAddressesInfo() {
    const self = this;

    async function handleTransactions(transactions) {
      // If we have cacheTx, then we will check if we know this transactions
      if (transactions.length > 0 && self.cacheTx) {
        transactions.forEach(async (tx) => {
          const knownTx = Object.keys(self.transactions);
          if (!knownTx.includes(tx)) {
            await self.fetchTransactionInfo(tx);
          }
        });
      }

      return true;
    }
    async function fetcher(addressId, addressType = 'external') {
      const keys = Object.keys(self.addresses[addressType]);
      if (keys.length <= addressId) {
        return self.getAddress(addressId, addressType);
      }

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
      handleTransactions(transactions);
      self.addresses[addressType][path].balance = balance;
      self.addresses[addressType][path].transactions = transactions;
      self.addresses[addressType][path].fetchedTimes += 1;
      self.addresses[addressType][path].utxos = utxo;

      if (transactions.length > 0) self.addresses[addressType][path].used = true;

      return self.addresses[addressType][path];
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

  async getTransactionHistory() {
    let txs = [];
    const self = this;
    Object.keys(this.addresses.external).forEach((key) => {
      const el = this.addresses.external[key];
      if (el.transactions && el.transactions.length > 0) {
        txs = txs.concat(el.transactions);
      }
    });
    Object.keys(this.addresses.internal).forEach((key) => {
      const el = this.addresses.internal[key];
      if (el.transactions && el.transactions.length > 0) {
        txs = txs.concat(el.transactions);
      }
    });

    txs = txs.filter((item, pos, self) => self.indexOf(item) === pos);

    const p = [];
    txs.filter(el => ({ tx: p.push(self.getTransaction(el)) }));
    const history = await Promise.all(p);
    return history;
  }

  async getTransaction(id = null) {
    const self = this;
    return (id !== null && self.transport) ? (self.transport.getTransaction(id)) : [];
  }

  generateAddress(path) {
    if (!path) throw new Error('Expected path to generate an address');
    const index = path.split('/')[5];
    const type = (path.split('/')[4] === '0') ? 'external' : 'internal';

    const privateKey = this.RootHDPrivateKey.derive(path);

    const address = new Dashcore.Address(privateKey.publicKey.toAddress(), this.network).toString();

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
    const tx = new Dashcore.Transaction();

    if (!opts || (!opts.amount && !opts.satoshis)) {
      throw new Error('An amount in dash or in satoshis is expected to create a transaction');
    }
    if (!opts || (!opts.to)) {
      throw new Error('A recipient is expected to create a transaction');
    }
    const utxos = this.getUTXOS();
    if (!utxos || utxos.length === 0) return tx;

    const inputs = [utxos[0]];

    if (!inputs) return tx;
    tx.from(inputs);

    const satoshis = (opts.amount && !opts.satoshis) ? dashToDuffs(opts.amount) : opts.satoshis;
    // console.log(opts);

    const outputs = [{ address: opts.to, satoshis }];
    tx.to(outputs);

    const addressChange = this.getUnusedAddress(false, 1).address;
    tx.change(addressChange);

    const feeRate = (opts.isInstantSend) ? feeCalculation('instantSend') : feeCalculation();
    if (feeRate.type === 'perBytes') {
      // console.log(feeRate.value * tx.size)
      // tx.feePerKb(feeRate.value * 10);
      tx.fee(10000);
    }
    if (feeRate.type === 'perInputs') {
      const fee = inputs.length * feeRate.value;
      tx.fee(fee);
    }

    const privateKeys = this.getPrivateKeys(utxos.map(el => ((el.address))));
    const signedTx = this.sign(tx, privateKeys, Dashcore.crypto.Signature.SIGHASH_ALL);

    return signedTx.toString();
  }

  // eslint-disable-next-line class-methods-use-this
  sign(object, privateKeys, sigType) {
    const handledTypes = ['Transaction', 'SubTxRegistrationPayload'];
    if (!privateKeys) throw new Error('Require one or multiple privateKeys to sign');
    if (!object) throw new Error('Nothing to sign');
    if (!handledTypes.includes(object.constructor.name)) {
      throw new Error(`Unhandled object of type ${object.constructor.name}`);
    }
    const obj = object.sign(privateKeys, sigType);
    if (!obj.isFullySigned()) {
      throw new Error('Not fully signed transaction');
    }
    return obj;
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
}

module.exports = Account;
