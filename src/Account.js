const Dashcore = require('@dashevo/dashcore-lib');
const { EventEmitter } = require('events');
const { BIP44_LIVENET_ROOT_PATH, BIP44_TESTNET_ROOT_PATH } = require('./Constants');
const {
  feeCalculation, is, dashToDuffs, duffsToDash, coinSelection,
} = require('./utils/');
const SyncWorker = require('./plugins/SyncWorker');
const BIP44Worker = require('./plugins/BIP44Worker');

const defaultOptions = {
  mode: 'full',
  cacheTx: true,
  subscribe: true,
};

const addAccountToWallet = function (account, wallet) {
  const { accounts } = wallet;

  const existAlready = accounts.filter(el => el.accountIndex === wallet.accountIndex).length > 0;
  if (!existAlready) {
    wallet.accounts.push(account);
  }
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

    // List of events we are waiting for before firing a ready
    // If we do have a bip44 enabled, generating the 20 address can take up to (10*20*2)ms
    const workersWatcher = {
      interval: null,
      clearInterval() {
        clearInterval(this.interval);
      },
      isReadyYet() {
        let isReady = true;
        const excludedKeys = ['isReadyYet', 'interval', 'clearInterval'];
        const keys = Object.keys(this).filter(_ => !excludedKeys.includes(_));
        keys.forEach((key) => {
          if (!this[key].ready) {
            isReady = false;
          }
        });
        return isReady;
      },
    };

    // As per BIP44, we prefetch 20 address
    if (this.mode === 'full') {
      workersWatcher.bip44 = { ready: false, started: false };
      this.events.on('WORKER/BIP44/STARTED', () => { workersWatcher.bip44.started = true; });
      this.events.on('WORKER/BIP44/EXECUTED', () => { workersWatcher.bip44.ready = true; });
      this.workers.bip44 = new BIP44Worker({
        events: this.events,
        storage: this.storage,
        getAddress: this.getAddress.bind(this),
      });
      this.workers.bip44.startWorker();
    }

    if (this.transport !== null) {
      workersWatcher.sync = { ready: false, started: false };
      this.events.on('WORKER/SYNC/STARTED', () => { workersWatcher.sync.started = true; });
      this.events.on('WORKER/SYNC/EXECUTED', () => { workersWatcher.sync.ready = true; });
      this.workers.sync = new SyncWorker({
        events: this.events,
        storage: this.storage,
        fetchAddressInfo: this.fetchAddressInfo.bind(this),
        fetchTransactionInfo: this.fetchTransactionInfo.bind(this),
        transport: this.transport,
      });
      this.workers.sync.startWorker();
    }

    // Handle import of cache
    if (opts.cache) {
      if (opts.cache.transactions) {
        try {
          this.storage.importTransactions(opts.cache.transactions);
        } catch (e) {
          this.disconnect();
          throw e;
        }
      }
      if (opts.cache.addresses) {
        try {
          this.storage.importAddresses(opts.cache.addresses);
        } catch (e) {
          this.disconnect();
          throw e;
        }
      }
    }
    const self = this;

    self.events.emit('started');
    addAccountToWallet(this, wallet);
    workersWatcher.interval = setInterval(() => {
      if (workersWatcher.isReadyYet()) {
        self.events.emit('ready');
        workersWatcher.clearInterval();
      }
    }, 20);
  }


  async broadcastTransaction(rawtx, isIs = false) {
    if (!this.transport) throw new Error('A transport layer is needed to perform a broadcast');

    const txid = await this.transport.sendRawTransaction(rawtx, isIs);
    if (is.txid(txid)) {
      const {
        inputs, outputs,
      } = new Dashcore.Transaction(rawtx).toObject();

      let totalSatoshis = 0;
      outputs.forEach((out) => {
        totalSatoshis += out.satoshis;
      });

      const affectedTxs = [];
      inputs.forEach((input) => {
        affectedTxs.push(input.prevTxId);
      });

      affectedTxs.forEach((affectedtxid) => {
        const { path, type } = this.storage.searchAddressWithTx(affectedtxid);
        const address = this.storage.store.addresses[type][path];
        const cleanedUtxos = [];
        address.utxos.forEach((utxo) => {
          if (utxo.txId === affectedtxid) {
            totalSatoshis -= utxo.satoshis;
            address.balanceSat -= utxo.satoshis;
            address.balance = duffsToDash(address.balanceSat);
          } else {
            cleanedUtxos.push(utxo);
          }
        });
        address.utxos = cleanedUtxos;
        console.log('Broadcast totalSatoshi', totalSatoshis);
        // this.storage.store.addresses[type][path].fetchedLast = 0;// In order to trigger a refresh
        this.events.emit('balance_changed');
      });
    }
    return txid;
  }


  async fetchTransactionInfo(tx) {
    // valueIn, valueOut,
    const {
      txid, blockhash, blockheight, blocktime, fees, size, vin, vout, txlock,
    } = await this.transport.getTransaction(tx);

    return {
      txid,
      blockhash,
      blockheight,
      blocktime,
      fees,
      size,
      vout,
      vin,
      txlock,
    };
  }

  async fetchAddressInfo(addressObj, fetchUtxo = true) {
    const self = this;
    const { address, path } = addressObj;
    const {
      balance, balanceSat, unconfirmedBalanceSat, transactions,
    } = await this.transport.getAddressSummary(address);
    const addrInfo = {
      address,
      path,
      balance,
      balanceSat,
      unconfirmedBalanceSat,
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
      const parsedUtxos = [];
      utxos.forEach((utxo) => {
        parsedUtxos.push(Object.assign({}, {
          script: utxo.scriptPubKey,
          satoshis: utxo.satoshis,
          txId: utxo.txid,
          address: utxo.address,
          outputIndex: utxo.vout,
        }));
      });
      return parsedUtxos;
    }
    if (fetchUtxo) {
      const originalUtxo = (await self.transport.getUTXO(address));
      const utxo = (balance > 0) ? parseUTXO(originalUtxo) : [];
      addrInfo.utxos = utxo;
    }
    return addrInfo;
  }

  getTransactions() {
    return this.store.transactions;
  }

  getAddresses(external = true) {
    const type = (external) ? 'external' : 'internal';
    return this.store.addresses[type];
  }

  getAddress(index = 0, external = true) {
    const type = (external) ? 'external' : 'internal';
    const path = (external) ? `${this.BIP44PATH}/0/${index}` : `${this.BIP44PATH}/1/${index}`;
    const { addresses } = this.storage.getStore();
    const addressType = addresses[type];
    return (addressType[path]) ? addressType[path] : this.generateAddress(path);
  }

  getUnusedAddress(external = true, skip = 0) {
    const type = (external) ? 'external' : 'internal';
    let unused = {
      address: '',
    };
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
    if (unused.address === '') {
      return this.getAddress(0, external);
    }
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

    txs = txs.filter((item, pos, txslist) => txslist.indexOf(item) === pos);
    const p = [];

    txs.forEach((txId) => {
      const search = self.storage.searchTransaction(txId);
      if (!search.found) {
        p.push(self.getTransaction(txId));
      } else {
        p.push(search.result);
      }
    });

    const resolvedPromises = await Promise.all(p) || [];

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
      let isSent = false;
      if (el.vin) {
        el.vin.forEach((vin) => {
          const { addr } = vin;
          if (this.storage.searchAddress(addr).found) {
            isSent = true;
          }
        });
      }

      const cleanElement = {
        type: (isSent) ? 'sent' : 'receive',
        txid: el.txid,
        time: el.time || el.blocktime || 0,
        from: (el.vin) ? el.vin.map(vin => vin.addr) : 'unknown',
      };
      if (el.vout) {
        cleanElement.to = cleanUnknownAddr(el.vout.map(vout => ({
          address: vout.scriptPubKey.addresses[0],
          amount: vout.value,
        })));
      } else {
        cleanElement.to = 'unknown';
      }


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
      balanceSat: 0,
      unconfirmedBalanceSat: 0,
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
   * @return {number} Balance in dash
   */
  getBalance(unconfirmed = true, displayDuffs = false) {
    let balance = 0;
    const { addresses } = this.storage.getStore();
    const { external, internal } = addresses;
    const externalPaths = (external && Object.keys(external)) || [];
    const internalPaths = (internal && Object.keys(internal)) || [];
    if (externalPaths.length > 0) {
      externalPaths.forEach((path) => {
        const { unconfirmedBalanceSat, balanceSat } = external[path];
        balance += (unconfirmed) ? unconfirmedBalanceSat + balanceSat : balanceSat;
      });
    }
    if (externalPaths.length > 0) {
      internalPaths.forEach((path) => {
        const { unconfirmedBalanceSat, balanceSat } = internal[path];
        balance += (unconfirmed) ? unconfirmedBalanceSat + balanceSat : balanceSat;
      });
    }
    return (displayDuffs) ? balance : duffsToDash(balance);
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
    const satoshis = (opts.amount && !opts.satoshis) ? dashToDuffs(opts.amount) : opts.satoshis;
    if (!opts || (!opts.to)) {
      throw new Error('A recipient is expected to create a transaction');
    }

    const outputs = [{ address: opts.to, satoshis }];
    outputs.forEach((output) => {
      tx.to(output.address, output.satoshis);
    });

    if (outputs[0].satoshis > this.getBalance(true, true)) {
      throw new Error('Not enought fund');
    }

    const utxosList = this.getUTXOS();
    const utxos = coinSelection(utxosList, outputs);

    const inputs = utxos.utxos.reduce((accumulator, current) => {
      const unspentoutput = new Dashcore.Transaction.UnspentOutput(current);
      accumulator.push(unspentoutput);

      return accumulator;
    }, []);

    if (!inputs) return tx;
    tx.from(inputs);

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

    const addressList = utxos.utxos.map(el => ((el.address)));
    const privateKeys = this.getPrivateKeys(addressList);
    const signedTx = this.sign(tx, privateKeys, Dashcore.crypto.Signature.SIGHASH_ALL);

    return signedTx.toString();
  }

  // eslint-disable-next-line class-methods-use-this
  sign(object, privateKeys, sigType = Dashcore.crypto.Signature.SIGHASH_ALL) {
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
    let addresses = [];
    let privKeys = [];
    if (addressList.constructor.name === 'Object') {
      addresses = [addressList];
    } else { addresses = addressList; }

    const self = this;
    const subwallets = Object.keys(this.store.addresses);
    subwallets.forEach((subwallet) => {
      const paths = Object.keys(self.store.addresses[subwallet]);
      paths.forEach((path) => {
        const address = self.store.addresses[subwallet][path];
        if (addresses.includes(address.address)) {
          const { privateKey } = self.keychain.getKeyForPath(address.path);
          privKeys = privKeys.concat([privateKey]);
        }
      });
    });

    return privKeys;
  }

  forceRefreshAccount() {
    if (!this.transport) {
      throw new Error('A transport layer is needed to perform a full refresh');
    }

    ['internal', 'external', 'misc'].forEach((type) => {
      Object.keys(this.storage.store.addresses[type]).forEach((path) => {
        this.storage.store.addresses[type][path].fetchedLast = 0;
      });
    });
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
