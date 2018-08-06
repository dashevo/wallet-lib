const Dashcore = require('@dashevo/dashcore-lib');
const { EventEmitter } = require('events');
const { BIP44_LIVENET_ROOT_PATH, BIP44_TESTNET_ROOT_PATH } = require('./Constants');
const { feeCalculation, is, dashToDuffs } = require('./utils/');
const SyncWorker = require('./plugins/SyncWorker');
const BIP44Worker = require('./plugins/BIP44Worker');

const defaultOptions = {
  mode: 'full',
  cacheTx: true,
  subscribe: true,
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

    this.transactions = {};

    this.label = (opts && opts.label && is.string(opts.label)) ? opts.label : null;

    // If transport is null or invalid, we won't try to fetch anything
    this.transport = wallet.transport;

    this.addAccountToWallet(wallet);

    this.store = wallet.storage.store;
    this.storage = wallet.storage;
    this.storage.importAccounts({
      label: this.label,
      path: this.BIP44PATH,
      network: this.network,
    });
    this.keychain = wallet.keychain;
    this.mode = (opts.mode) ? opts.mode : defaultOptions.mode;

    this.cacheTx = (opts.cacheTx) ? opts.cacheTx : defaultOptions.cacheTx;
    this.workers = {};

    // As per BIP44, we prefetch 20 address
    if (this.mode === 'full') {
      this.workers.bip44 = new BIP44Worker({
        storage: this.storage,
        getAddress: this.getAddress.bind(this),
      });
      this.workers.bip44.startWorker();
    }

    if (this.transport !== null) {
      this.workers.sync = new SyncWorker({
        events: this.events,
        storage: this.storage,
        fetchAddressInfo: this.fetchAddressInfo.bind(this),
        transport: this.transport,
      });
      this.workers.sync.startWorker();
    }

    const self = this;
    self.events.emit('started');
    setTimeout(() => {
      self.events.emit('ready');
    }, 5000);
  }

  addAccountToWallet(wallet) {
    const self = this;
    const { accounts } = wallet;

    const existAlready = accounts.filter(el => el.accountIndex === self.accountIndex).length > 0;
    if (!existAlready) {
      wallet.accounts.push(this);
    }
  }

  async broadcastTransaction(rawtx, isIs = false) {
    const txid = await this.transport.sendRawTransaction(rawtx, isIs);
    return txid;
  }


  async fetchTransactionInfo(tx) {
    // valueIn, valueOut, vin, vout,
    const {
      txid, blockhash, blockheight, blocktime, fees, size, txlock,
    } = await this.transport.getTransaction(tx);

    return {
      txid,
      blockhash,
      blockheight,
      blocktime,
      fees,
      size,
      txlock,
    };
  }

  async fetchAddressInfo(addressObj, fetchUtxo = true) {
    const self = this;
    const { address, path } = addressObj;
    const { balance, transactions } = await this.transport.getAddressSummary(address);
    const addrInfo = {
      address,
      path,
      balance,
      transactions,
      fetchedLast: +new Date(),
    };

    if (transactions.length > 0) {
      addrInfo.used = true;

      // If we have cacheTx, then we will check if we know this transactions
      if (self.cacheTx) {
        transactions.forEach(async (tx) => {
          const knownTx = Object.keys(self.store.transactions);
          if (!knownTx.includes(tx)) {
            const txInfo = await self.fetchTransactionInfo(tx);
            await self.storage.importTransactions(txInfo);
          }
        });
      }
    }

    // We do not need to fetch UTXO if we don't have any money there :)
    function parseUTXO(utxos) {
      return utxos.filter((utxo) => {
        const utxoRes = utxo;
        delete utxoRes.confirmations;
        return utxoRes;
      });
    }
    if (fetchUtxo) {
      const utxo = (balance > 0) ? parseUTXO(await self.transport.getUTXO(address)) : [];
      addrInfo.utxos = utxo;
    }
    return addrInfo;
  }

  getAddresses(external = true) {
    const type = (external) ? 'external' : 'internal';
    return this.store.addresses[type];
  }

  getAddress(index = 0, external = true) {
    const type = (external) ? 'external' : 'internal';
    const path = (external) ? `${this.BIP44PATH}/0/${index}` : `${this.BIP44PATH}/1/${index}`;
    const addressType = this.store.addresses[type];
    return (addressType[path]) ? addressType[path] : this.generateAddress(path);
  }

  getUnusedAddress(external = true, skip = 0) {
    const type = (external) ? 'external' : 'internal';
    let unused = null;
    let skipped = 0;
    const keys = Object.keys(this.store.addresses[type]);
    // eslint-disable-next-line array-callback-return
    keys.some((key) => {
      const el = (this.store.addresses[type][key]);
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
    const self = this;
    let txs = [];
    Object.keys(this.store.addresses.external).forEach((key) => {
      const el = this.store.addresses.external[key];
      if (el.transactions && el.transactions.length > 0) {
        txs = txs.concat(el.transactions);
      }
    });
    Object.keys(this.store.addresses.internal).forEach((key) => {
      const el = this.store.addresses.internal[key];
      if (el.transactions && el.transactions.length > 0) {
        txs = txs.concat(el.transactions);
      }
    });

    txs = txs.filter((item, pos, self) => self.indexOf(item) === pos);
    const p = [];
    txs.filter(el => ({ tx: p.push(self.getTransaction(el)) }));
    const resolvedPromises = await Promise.all(p);

    function cleanUnknownAddr(data) {
      const knownAddr = [];
      Object.keys(self.store.addresses.external).forEach((key) => {
        const el = self.store.addresses.external[key];
        knownAddr.push(el.address);
      });
      Object.keys(self.store.addresses.internal).forEach((key) => {
        const el = self.store.addresses.internal[key];
        knownAddr.push(el.address);
      });
      Object.keys(self.store.addresses.misc).forEach((key) => {
        const el = self.store.addresses.misc[key];
        knownAddr.push(el.address);
      });

      return data.filter(el => (knownAddr.includes(el.address)))[0];
    }
    const history = resolvedPromises.map((el) => {
      const cleanElement = {
        type: 'receive',
        txid: el.txid,
        time: el.time,
        from: el.vin.map(vin => vin.addr),
      };
      cleanElement.to = cleanUnknownAddr(el.vout.map(vout => ({
        address: vout.scriptPubKey.addresses[0],
        amount: vout.value,
      })));

      return cleanElement;
    });

    return history;
  }

  async getTransaction(id = null) {
    const self = this;
    return (id !== null && self.transport) ? (self.transport.getTransaction(id)) : [];
  }

  generateAddress(path) {
    if (!path) throw new Error('Expected path to generate an address');
    const index = path.split('/')[5];
    const privateKey = this.keychain.getKeyForPath(path);

    const address = new Dashcore.Address(privateKey.publicKey.toAddress(), this.network).toString();

    const addressData = {
      path,
      index,
      address,
      // privateKey,
      transactions: [],
      balance: 0,
      utxos: [],
      fetchedLast: 0,
      used: false,
    };
    this.storage.importAddresses(addressData);
    return addressData;
  }

  /**
   * Return the total balance of an account.
   * Ezpect paralel fetching/discovery to be activated.
   * @return {number} Balance in duffs
   */
  getBalance() {
    let balance = 0;
    const { addresses } = this.storage.getStore();
    const { external, internal } = addresses;
    const externalPaths = (external && Object.keys(external)) || [];
    const internalPaths = (internal && Object.keys(internal)) || [];
    if (externalPaths.length > 0) {
      externalPaths.forEach((path) => {
        balance += external[path].balance;
      });
    }
    if (externalPaths.length > 0) {
      internalPaths.forEach((key) => {
        balance += internal[key].balance;
      });
    }
    return balance;
  }

  getUTXOS(onlyAvailable = true) {
    let utxos = [];

    const self = this;
    const subwallets = Object.keys(this.store.addresses);
    subwallets.forEach((subwallet) => {
      const paths = Object.keys(self.store.addresses[subwallet]);
      paths.forEach((path) => {
        const address = self.store.addresses[subwallet][path];
        if (address.utxos) {
          if (!(onlyAvailable && address.locked)) {
            const utxo = address.utxos;
            utxos = utxos.concat(utxo);
          }
        }
      });
    });
    utxos = utxos.sort((a, b) => b.satoshis - a.satoshis);
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
    if (!utxos || utxos.length === 0) {
      if (this.getBalance() > 0) {
        // In this case, we just don't have proper UTXO
      } else { return tx; }
    }

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
    const subwallets = Object.keys(this.store.addresses);
    subwallets.forEach((subwallet) => {
      const paths = Object.keys(self.store.addresses[subwallet]);
      paths.forEach((path) => {
        const address = self.store.addresses[subwallet][path];
        if (addressList.includes(address.address)) {
          privKeys = privKeys.concat([self.keychain.getKeyForPath(address.path).privateKey]);
          // privKeys = privKeys.concat([address.privateKey.privateKey]);
        }
      });
    });

    return privKeys;
  }

  disconnect() {
    if (this.transport) {
      this.transport.disconnect();
    }
    if (this.workers) {
      const workersKey = Object.keys(this.workers);
      workersKey.forEach((key) => {
        this.workers[key].stopWorker();
      });
    }
    if (this.storage) {
      this.storage.stopWorker();
    }
  }
}

module.exports = Account;
