const {
  BloomFilter, Transaction, MerkleBlock,
} = require('@dashevo/dashcore-lib');
const logger = require('../../../../logger');
const TransporterGenericError = require('../../../../errors/TransporterGenericError');

const { BLOOM_FALSE_POSITIVE_RATE } = require('../../../../CONSTANTS');

const parseSubscribeToTransactionsWithProofsResponse = require('../utils/parseSubscribeToTransactionsWithProofsResponse');
/**
 * From a given addressList will create and submit a bloomfilter to DAPI
 * and parse response looking for relevant inputs and outputs.
 * @param addressList
 * @return {Promise<void>}
 */

module.exports = async function subscribeToTransactionWithProofs(
  addressList,
  opts = { fromBlockHeight: 1 },
) {
  const self = this;
  const { client, network } = this;
  logger.silly(`DAPIClient.subscribeToTransactionWithProofs[${addressList}]`);

  const bloomfilter = BloomFilter.create(addressList.length, BLOOM_FALSE_POSITIVE_RATE);

  addressList.forEach((address) => {
    bloomfilter.insert(Buffer.from(address));
  });
  if (!opts.fromBlockHeight && !opts.fromBlockHash) {
    throw new Error('fromBlockHeight or fromBlockHash needs to be specified');
  }
  if (opts.fromBlockHeight === 0) {
    // Historically, in order to avoid hard fork, in Bitcoin, genesis block is non-spendable.
    // Therefore we continue to have it as an hardcoded non-included UTXO
    // Thus, we start to one (also provokes a Internal Error if we would try to start at zero).
    // eslint-disable-next-line no-param-reassign
    opts.fromBlockHeight = 1;
  }
  const initialHeight = (opts.fromBlockHeight)
    ? opts.fromBlockHeight
    : await client.getBlockByHash(opts.fromBlockHash);
  const currentTipHeight = await this.getBestBlockHeight();
  logger.silly(`DAPIClient.subscribeToTransactionWithProofs[${initialHeight}/${currentTipHeight}]`);

  const stream = await client.subscribeToTransactionsWithProofs(bloomfilter, opts);
  this.state.subscriptions.transactions.push(stream);
  stream
    .on('data', async (response) => {
      await parseSubscribeToTransactionsWithProofsResponse(self, response, {
        currentTipHeight,
        network,
        addressList,
      });
    })
    .on('error', (err) => {
      stream.cancel();
      throw new TransporterGenericError('subscribeToTransactionWithProofs', err.details);
    });
};
