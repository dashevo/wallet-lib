const {
  BloomFilter, Transaction,
} = require('@dashevo/dashcore-lib');
const logger = require('../../../../logger');
const TransporterGenericError = require('../../../../errors/TransporterGenericError');

const { BLOOM_FALSE_POSITIVE_RATE } = require('../../../../CONSTANTS');
/**
 * From a given addressList will create and submit a bloomfilter to DAPI
 * and parse response looking for relevant inputs and outputs.
 * @param addressList
 * @return {Promise<void>}
 */
module.exports = async function subscribeToTransactionWithProofs(addressList) {
  const { client, network } = this;
  logger.silly(`DAPIClient.subscribeToTransactionWithProofs[${addressList}]`);

  const bloomfilter = BloomFilter.create(addressList.length, BLOOM_FALSE_POSITIVE_RATE);

  addressList.forEach((address) => {
    bloomfilter.insert(Buffer.from(address));
  });

  // Historically, in order to avoid hard fork, in Bitcoin, genesis block is non-spendable.
  // Therefore we continue to have it as an hardcoded non-included UTXO
  // Thus, we start to one (also provokes a Internal Error if we would try to start at zero).
  const subscriptionOpts = { fromBlockHeight: 1 };

  const stream = await client.subscribeToTransactionsWithProofs(bloomfilter, subscriptionOpts);
  stream
    .on('data', (response) => {
      const merkleBlock = response.getRawMerkleBlock();
      const transactions = response.getRawTransactions();
      if (merkleBlock) {
        // const merkleBlockHex = Buffer.from(merkleBlock).toString('hex');
      }
      if (transactions) {
        transactions.getTransactionsList()
          .forEach((_tx) => {
            const tx = new Transaction(Buffer.from(_tx));

            tx.inputs.forEach((input) => {
              if (input.script) {
                const addr = input.script.toAddress(network).toString();
                if (addressList.includes(addr)) {
                  const { outputIndex } = input;
                  const prevTxId = input.prevTxId.toString('hex');
                  logger.silly(`Received spent output ${prevTxId}:${outputIndex} in ${tx.hash}`);
                  // TODO : Transmit to Account in order to get this UTXO removed (because spent).
                }
              }
            });

            tx.outputs.forEach((output, outputIndex) => {
              const addr = output.script.toAddress(network).toString();
              if (addressList.includes(addr)) {
                logger.silly(`Received unspent output ${tx.hash}:${outputIndex} of value ${output.satoshis}`);
                // TODO : Transmit to Account in order to get this UTXO added.
              }
            });
          });
      }
    })
    .on('error', (err) => {
      stream.cancel();
      throw new TransporterGenericError('subscribeToTransactionWithProofs', err.details);
    });
};
