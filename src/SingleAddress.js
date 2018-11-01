const Dashcore = require('@dashevo/dashcore-lib');
const { EventEmitter } = require('events');
const SingleSyncWorker = require('./plugins/Workers/SingleSyncWorker');
const _ = require('lodash');
const {dashToDuffs,duffsToDash,coinSelection, feeCalculation, is} = require('./utils/');
const defaultOptions = {
  network: 'testnet',
  subscribe: true
};
const getNetwork = function (network) {
  return Dashcore.Networks[network] || Dashcore.Networks.testnet;
};

// TODO : Code that is shared (getUTXOS, getBalance, should came from a centralized place or smth
class SingleAddress {
  constructor(wallet, opts = defaultOptions) {
    this.events = new EventEmitter();
    this.isReady = false;

    if (!wallet || wallet.constructor.name !== 'Wallet') throw new Error('Expected wallet to be created and passed as param');

    this.network = getNetwork(wallet.network);

    this.transactions = {};
    this.label = (opts && opts.label && is.string(opts.label)) ? opts.label : null;
    this.transport = wallet.transport;
    this.store = wallet.storage.store;
    this.storage = wallet.storage;
    this.walletId = wallet.walletId;

    this.storage.importSingleAddress({
      label: this.label,
      path: '0',
      network: this.network,
    }, this.walletId);

    this.keychain = wallet.keychain;
    // this.publicKey = this.keychain.getPrivateKey().toPublicKey();
    // this.publicAddress = this.keychain.getPrivateKey().toAddress(this.network);
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
    if (this.transport && this.transport.isValid) {
      workersWatcher.singlesync = { ready: false, started: false };
      this.events.on('WORKER/SINGLESYNC/STARTED', () => { workersWatcher.singlesync.started = true; });
      this.events.on('WORKER/SINGLESYNC/EXECUTED', () => { workersWatcher.singlesync.ready = true; });
      this.workers.singlesync = new SingleSyncWorker({
        events: this.events,
        storage: this.storage,
        fetchAddressInfo: this.fetchAddressInfo.bind(this),
        fetchTransactionInfo: this.fetchTransactionInfo.bind(this),
        fetchStatus: this.fetchStatus.bind(this),
        transport: this.transport,
        walletId: this.walletId,

      });
      this.workers.singlesync.startWorker();
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
    }
    this.events.emit('started')
    // addSingleAddressToWallet()
    const self = this;
    workersWatcher.interval = setInterval(() => {
      if (workersWatcher.isReadyYet()) {
        self.events.emit('ready');
        this.isReady = true;
        workersWatcher.clearInterval();
      }
    }, 20);  }
  /**
   * Fetch address info  from the transport layer
   * @param fetchUtxo - If we also query the utxo (default: yes)
   * @return {Promise<addressInfo>}
   */
  async fetchAddressInfo(fetchUtxo = true) {
    if (!this.transport.isValid) throw new Error('A transport layer is needed to fetch addr info');
    const self = this;
    const address = this.getAddress();
    const {
      balanceSat, unconfirmedBalanceSat, transactions,
    } = await this.transport.getAddressSummary(address);

    const addrInfo = {
      address,
      path:'0',
      balanceSat,
      unconfirmedBalanceSat,
      transactions,
      fetchedLast: +new Date(),
    };
    addrInfo.used = (transactions.length > 0);
    if (transactions.length > 0) {
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
      const utxo = (balanceSat > 0) ? parseUTXO(originalUtxo) : [];
      addrInfo.utxos = utxo;
    }
    return addrInfo;
  }
  getAddress(){
    return this.keychain.getPrivateKey().toAddress(this.network).toString();
  }
  /**
   * Fetch a specific txid from the transport layer
   * @param transactionid - The transaction id to fetch
   * @return {Promise<{txid, blockhash, blockheight, blocktime, fees, size, vout, vin, txlock}>}
   */
  async fetchTransactionInfo(transactionid) {
    if (!this.transport.isValid) throw new Error('A transport layer is needed to fetch tx info');

    // valueIn, valueOut,
    const {
      txid, blockhash, blockheight, blocktime, fees, size, vin, vout, txlock,
    } = await this.transport.getTransaction(transactionid);


    const feesInSat = is.float(fees) ? dashToDuffs(fees) : (fees);
    return {
      txid,
      blockhash,
      blockheight,
      blocktime,
      fees: feesInSat,
      size,
      vout,
      vin,
      txlock,
    };
  }
  async fetchStatus(){
    if (!this.transport.isValid) throw new Error('A transport layer is needed to fetch status');
    return (typeof this.transport.getStatus==='function') ? this.transport.getStatus() : false;
  }
  /**
   * Return the total balance of an account.
   * Expect paralel fetching/discovery to be activated.
   * @return {number} Balance in dash
   */
  getBalance(unconfirmed = true, displayDuffs = true) {
    let totalSat = 0;
    const { addresses } = this.storage.getStore().wallets[this.walletId];
    const { misc } = addresses;
    const miscPaths = (misc && Object.keys(misc)) || [];
    if (miscPaths.length > 0) {
      miscPaths.forEach((path) => {
        const { unconfirmedBalanceSat, balanceSat } = misc[path];
        totalSat += (unconfirmed) ? unconfirmedBalanceSat + balanceSat : balanceSat;
      });
    }

    return (displayDuffs) ? totalSat : duffsToDash(totalSat);
  }

  /**
   * Return all the utxos (unspendable included)
   * @param {Boolean} onlyAvailable - Only return available utxos (spendable)
   * @return {Array}
   */
  getUTXOS(onlyAvailable = true) {
    let utxos = [];

    const self = this;
    const { walletId } = this;
      const paths = Object.keys(self.store.wallets[walletId].addresses.misc);
      paths.forEach((path) => {
        const address = self.store.wallets[walletId].addresses.misc[path];
        if (address.utxos) {
          if (!(onlyAvailable && address.locked)) {
            const utxo = address.utxos;
            utxos = utxos.concat(utxo);
          }
        }
    });
    utxos = utxos.sort((a, b) => b.satoshis - a.satoshis);
    return utxos;
  }
  /**
   * Force a refresh of all the addresses informations (utxo, balance, txs...)
   * @return {Boolean}
   */
  forceRefreshAccount() {
    const addressStore = this.storage.store.wallets[this.walletId].addresses;
    ['internal', 'external', 'misc'].forEach((type) => {
      Object.keys(addressStore[type]).forEach((path) => {
        addressStore[type][path].fetchedLast = 0;
      });
    });
    return true;
  }
  // TODO : Add tests
  updateNetwork(network) {
    console.log(`Account network - update to(${network}) - from(${this.network}`);
    if (is.network(network) && network !== this.network) {
      this.BIP44PATH = getBIP44Path(network, this.accountIndex);
      this.network = getNetwork(network);
      this.storage.store.wallets[this.walletId].network = network.toString();
      if (this.transport.isValid) {
        return this.transport.updateNetwork(network);
      }
    }
    return false;
  }
  /**
   * Create a transaction based on the passed information
   * @param opts - Options object
   * @param opts.amount - Amount in dash that you want to send
   * @param opts.satoshis - Amount in satoshis
   * @param opts.to - Address of the recipient
   * @param opts.isInstantSend - If you want to use IS or stdTx.
   * @return {String} - rawTx
   */
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

    if (outputs[0].satoshis > this.getBalance(true)) {
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

    const addressChange = this.getAddress();
    tx.change(addressChange);

    const feeRate = (opts.isInstantSend) ? feeCalculation('instantSend') : feeCalculation();
    if (feeRate.type === 'perBytes') {
      tx.fee(10000);
    }
    if (feeRate.type === 'perInputs') {
      const fee = inputs.length * feeRate.value;
      tx.fee(fee);
    }

    const privateKeys = [this.getPrivateKey()];
    const signedTx = this.keychain.sign(tx, privateKeys, Dashcore.crypto.Signature.SIGHASH_ALL);

    return signedTx.toString();
  }

  getPrivateKey(){
    return this.keychain.getPrivateKey();

  }
  /**
   * Broadcast a Transaction to the transport layer
   * @param rawtx {String} - the hexa representation of the transaxtion
   * @param isIs - If the tx is InstantSend tx todo: Should be automatically deducted from the rawtx
   * @return {Promise<*>}
   */
  async broadcastTransaction(rawtx, isIs = false) {
    if (!this.transport.isValid) throw new Error('A transport layer is needed to perform a broadcast');

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
        const address = this.storage.store.wallets[this.walletId].addresses[type][path];
        const cleanedUtxos = [];
        address.utxos.forEach((utxo) => {
          if (utxo.txId === affectedtxid) {
            totalSatoshis -= utxo.satoshis;
            address.balanceSat -= utxo.satoshis;
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


  /**
   * This method will disconnect from all the opened streams, will stop all running workers
   * and force a saving of the state.
   * You want to use this method at the end of your user usage of this lib.
   * @return {Boolean}
   */
  disconnect() {
    if (this.transport.isValid) {
      this.transport.disconnect();
    }
    if (this.workers) {
      const workersKey = Object.keys(this.workers);
      workersKey.forEach((key) => {
        this.workers[key].stopWorker();
      });
    }
    if (this.storage) {
      this.storage.saveState();
      this.storage.stopWorker();
    }
    return true;
  }
};

module.exports = SingleAddress;