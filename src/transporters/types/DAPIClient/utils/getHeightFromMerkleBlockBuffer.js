const {
  MerkleBlock,
} = require('@dashevo/dashcore-lib');

const getHeightFromMerkleBlockBuffer = async (client, merkleBlockBuffer) => {
  // FIXME: MerkleBlock do not accept hex.
  const merkleBlock = new MerkleBlock(Buffer.from(merkleBlockBuffer));
  const prevHash = merkleBlock.header.prevHash.reverse().toString('hex');

  const prevBlock = await client.getBlockByHash(prevHash);
  try {
    // console.log(prevHash)
    const prevBlockHeight = prevBlock.transactions[0].extraPayload.height;
    return prevBlockHeight + 1;
  } catch (e) {
    console.log(e);
    console.log(merkleBlock);
    console.log(prevHash);
    console.dir(prevBlock, { depth: 10});
    console.log(Buffer.from(merkleBlockBuffer).toString('hex'));
    const prevBlockHeight = prevBlock.transactions[1].extraPayload.height;
    return prevBlockHeight + 1;
  }
};
module.exports = getHeightFromMerkleBlockBuffer;
