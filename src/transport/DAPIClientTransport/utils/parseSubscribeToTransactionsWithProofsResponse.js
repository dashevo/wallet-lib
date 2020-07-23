const {
  Transaction, MerkleBlock,
} = require('@dashevo/dashcore-lib');
const logger = require('../../../logger');
const getHeightFromMerkleBlockBuffer = require('./getHeightFromMerkleBlockBuffer');
const EVENTS = require('../../../EVENTS');

const parseSubscribeToTransactionsWithProofsResponse = async (
  self,
  response,
  props = {
    currentTipHeight: 0,
    network: 'testnet',
    addressList: [],
  },
) => {
  const merkleBlockBuffer = response.getRawMerkleBlock();
  const transactions = response.getRawTransactions();
  if (merkleBlockBuffer) {
    const merkleBlock = new MerkleBlock(Buffer.from(merkleBlockBuffer));
    const prevHash = merkleBlock.header.prevHash.reverse().toString('hex');
    logger.silly('prevHash', prevHash);
    // const currentHeight = await getHeightFromMerkleBlockBuffer(self, merkleBlockBuffer);
    // logger.silly(`DAPIClient.subscribeToTransactionWithProofs[${currentHeight}/${props.currentTipHeight}]`);
  }
  if (transactions) {
    transactions.getTransactionsList()
      .forEach((_tx) => {
        const tx = new Transaction(Buffer.from(_tx));
        tx.inputs.forEach((input) => {
          if (input.script) {
            const addr = input.script.toAddress(props.network).toString();
            if (props.addressList.includes(addr)) {
              const { outputIndex } = input;
              const prevTxId = input.prevTxId.toString('hex');
              logger.silly(`Received spent output ${prevTxId}:${outputIndex} in ${tx.hash}`);
              // TODO : Transmit to Account in order to get this UTXO removed (because spent).
              self.announce(EVENTS.FETCHED_STXO, input);
            }
          }
        });

        tx.outputs.forEach((output, outputIndex) => {
          const addr = output.script.toAddress(props.network).toString();
          if (props.addressList.includes(addr)) {
            logger.silly(`Received unspent output ${tx.hash}:${outputIndex} of value ${output.satoshis}`);
            // TODO : Transmit to Account in order to get this UTXO added.
            self.announce(EVENTS.FETCHED_UTXO, output);
          }
        });
      });
  }
};
module.exports = parseSubscribeToTransactionsWithProofsResponse;
