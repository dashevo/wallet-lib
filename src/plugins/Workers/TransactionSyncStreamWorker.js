const {
  Transaction, MerkleBlock,
} = require('@dashevo/dashcore-lib');
const Worker = require('../Worker');

class TransactionSyncStreamWorker extends Worker {
  constructor(options) {
    super({
      name: 'IdentitySyncWorker',
      executeOnStart: true,
      firstExecutionRequired: true,
      workerIntervalTime: 60 * 1000,
      gapLimit: 10,
      dependencies: [
        'storage',
        'transporter',
        'walletId',
      ],
      ...options,
    });
  }

  /**
   * Filter transaction based on the address list
   * @param {Transaction[]} transactions
   * @param {string} addressList
   */
  static filterWalletTransactions(transactions, addressList) {

  }

  /**
   *
   * @param response
   * @return {[]}
   */
  static getTransactionListFromStreamResponse(response) {
    let walletTransactions = [];
    const merkleBlockBuffer = response.getRawMerkleBlock();
    const transactions = response.getRawTransactions();

    if (transactions) {
      walletTransactions = transactions
        .getTransactionsList()
        .map((rawTransaction) => new Transaction(Buffer.from(rawTransaction)));
    }

    return walletTransactions;
  }

  async initialSync() {
    // TODO: read the last synced block hash from the storage
    const fromBlockHeight = 1;
    const count = await this.getBestBlockHeight();

    const historicalStream = this.transporter
      .subscribeToTransactionsWithProofs({ fromBlockHeight, count });

    const historicalWalletTransactions = await new Promise(((resolve, reject) => {
      let transactions = [];
      historicalStream
        .on('data', async (response) => {
          const transactionsFromResponse = TransactionSyncStreamWorker
            .getTransactionListFromStreamResponse(response);
          const walletTransactions = TransactionSyncStreamWorker
            .filterWalletTransactions(transactionsFromResponse);

          transactions = transactions.concat(walletTransactions);
        })
        .on('error', (err) => {
          historicalStream.cancel();
          reject(err);
        })
        .on('end', () => {
          resolve(transactions);
        });
    }));
    return historicalWalletTransactions;
  }
}

module.exports = TransactionSyncStreamWorker;
