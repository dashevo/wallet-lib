const {
  Transaction,
} = require('@dashevo/dashcore-lib');
const getMissingIndexes = require('./BIP44Worker/utils/getMissingIndexes');
const isContiguousPath = require('./BIP44Worker/utils/isContiguousPath');

const Worker = require('../Worker');
const { BIP44_ADDRESS_GAP, WALLET_TYPES } = require('../../CONSTANTS');
const is = require('../../utils/is');

class TransactionSyncStreamWorker extends Worker {
  constructor(options) {
    super({
      name: 'TransactionSyncStreamWorker',
      executeOnStart: true,
      firstExecutionRequired: true,
      workerIntervalTime: 60 * 1000,
      gapLimit: 10,
      dependencies: [
        'storage',
        'transporter',
        'walletId',
        'getAddress',
      ],
      ...options,
    });
  }

  /**
   * Filter transaction based on the address list
   * @param {Transaction[]} transactions
   * @param {string[]} addressList
   * @param {string} network
   */
  static filterWalletTransactions(transactions, addressList, network) {
    const spentOutputs = [];
    const unspentOutputs = [];
    const filteredTransactions = transactions.filter((tx) => {
      let isWalletTransaction = false;

      tx.inputs.forEach((input) => {
        if (input.script) {
          const addr = input.script.toAddress(network).toString();
          if (addressList.includes(addr)) {
            spentOutputs.push(input);
            isWalletTransaction = true;
          }
        }
      });

      tx.outputs.forEach((output) => {
        const addr = output.script.toAddress(network).toString();
        if (addressList.includes(addr)) {
          unspentOutputs.push(output);
          isWalletTransaction = true;
        }
      });

      return isWalletTransaction;
    });

    return {
      transactions: filteredTransactions,
      spentOutputs,
      unspentOutputs,
    };
  }

  /**
   * Generates new adresses up to the gap limit and returns how many addresses
   * were added to the storage
   * @return {number} - number of generated addresses
   */
  fillAddressesToGapLimit() {
    let generated = 0;
    let unusedAddress = 0;
    const store = this.storage.getStore();
    const addresses = store.wallets[this.walletId].addresses.external;
    let addressesPaths = Object.keys(addresses);
    const { walletType } = this;
    const accountIndex = this.index;

    let prevPath;

    // Ensure that all our above paths are contiguous
    const missingIndexes = getMissingIndexes(addressesPaths);

    // Gets missing addresses and adds them to the storage
    // Please note that getAddress adds new addresses to storage, which it probably shouldn't
    missingIndexes.forEach((index) => {
      this.getAddress(index, 'external');
      if (walletType === WALLET_TYPES.HDWALLET) {
        this.getAddress(index, 'internal');
      }
    });

    const sortByIndex = (a, b) => parseInt(a.split('/')[5], 10) - parseInt(b.split('/')[5], 10);
    addressesPaths = Object
      .keys(store.wallets[this.walletId].addresses.external)
      .filter((el) => parseInt(el.split('/')[3], 10) === accountIndex)
      .sort(sortByIndex);

    // Scan already generated addresse and count how many are unused
    addressesPaths.forEach((path) => {
      const el = addresses[path];
      if (!el.used && el.path.length > 0) {
        el.used = true;
        throw new Error(`Conflicting information ${JSON.stringify(el)}`);
      }
      if (!el.used) unusedAddress += 1;
      if (!isContiguousPath(path, prevPath)) {
        throw new Error('Addresses are expected to be contiguous');
      }
      prevPath = path;
    });

    // Unused addresses are counted in the foreach above
    const addressToGenerate = BIP44_ADDRESS_GAP - unusedAddress;
    if (addressToGenerate > 0) {
      const lastElemPath = addressesPaths[addressesPaths.length - 1];
      const lastElem = addresses[lastElemPath];

      const startingIndex = (is.def(lastElem)) ? lastElem.index + 1 : 0;
      const lastIndex = addressToGenerate + startingIndex;
      if (lastIndex > startingIndex) {
        for (let i = startingIndex; i <= lastIndex; i += 1) {
          this.getAddress(i, 'external');
          generated += 1;
          if (walletType === WALLET_TYPES.HDWALLET) {
            this.getAddress(i, 'internal');
          }
        }
      }
    }

    return generated;
  }

  /**
   *
   * @param response
   * @return {[]}
   */
  static getTransactionListFromStreamResponse(response) {
    let walletTransactions = [];
    const transactions = response.getRawTransactions();

    if (transactions) {
      walletTransactions = transactions
        .getTransactionsList()
        .map((rawTransaction) => new Transaction(Buffer.from(rawTransaction)));
    }

    return walletTransactions;
  }

  getAddressesToSync() {
    const addressList = [];

    const { addresses } = this.storage.getStore().wallets[this.walletId];
    Object.keys(addresses).forEach((walletType) => {
      const walletAddresses = addresses[walletType];
      const walletPaths = Object.keys(walletAddresses);
      if (walletPaths.length > 0) {
        walletPaths.forEach((path) => {
          const address = walletAddresses[path];
          addressList.push(address);
        });
      }
    });
    return addressList;
  }

  /**
   *
   * @param {number} fromBlockHeight
   * @param {number} count
   * @param {string} network
   * @return {Promise<unknown>}
   */
  async syncUpToTheGapLimit(fromBlockHeight, count, network) {
    const addresses = this.getAddressesToSync();

    const stream = await this.transporter
      .subscribeToTransactionsWithProofs(addresses, { fromBlockHeight, count });

    return new Promise((resolve, reject) => {
      let transactions = [];
      stream
        .on('data', (response) => {
          const transactionsFromResponse = TransactionSyncStreamWorker
            .getTransactionListFromStreamResponse(response);
          const walletTransactions = TransactionSyncStreamWorker
            .filterWalletTransactions(transactionsFromResponse, addresses, network);

          transactions = transactions.concat(walletTransactions);
          const addressesGeneratedCount = this.storage.importTransactions(transactions);

          // const addressesGeneratedCount = this.fillAddressesToGapLimit();
          if (addressesGeneratedCount > 0) {
            // If there are some new addresses being imported
            // to the storage, that mean that we hit the gap limit
            // and we need to update the bloom filter with new addresses,
            // i.e. we need to open another stream with a bloom filter
            // that contains new addresses.
            // TODO: is this will call stream.on('end', cb)?
            stream.end();
          }
        })
        .on('error', (err) => {
          stream.cancel();
          reject(err);
        })
        .on('end', () => {
          resolve(transactions);
        });
    });
  }

  /**
   * Return last synced block height
   * @return {number}
   */
  getLastSyncedBlockHeight() {
    // TODO: implement the method
    return 1;
  }

  /**
   *
   * @param {string} network
   * @return {Promise<void>}
   */
  async initialSync(network) {
    // TODO: read the last synced block hash from the storage
    let currentBlockHeight = 0;
    const bestBlockHeight = await this.getBestBlockHeight();
    let blocksLeft = bestBlockHeight - currentBlockHeight;

    while (blocksLeft !== 0) {
      // Every time the gap limit is hit, we need to restart historical stream
      // until we synced up to the last block
      currentBlockHeight = this.getLastSyncedBlockHeight();
      blocksLeft -= currentBlockHeight;
      await this.syncUpToTheGapLimit(currentBlockHeight, bestBlockHeight, network);
    }
  }
}

module.exports = TransactionSyncStreamWorker;
