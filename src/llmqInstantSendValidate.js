const { chain } = require('lodash');
const { hash } = require('./utils/crypto');

// https://github.com/dashpay/dips/blob/master/dip-0006.md

module.exports = async (dapiClient, masternode, llmq, dkg) => {
  const {
    quorumSize,
  } = llmq;

  const {
    quorumHeight,
    quorumHash,
  } = dkg;

  const protxList = await dapiClient.MNDiscovery.getProtxList(quorumHeight);
  const deterministicMnList = chain(protxList)
    .filter(({ confirmed }) => confirmed)
    .map((mn) => ({
      hash: hash(mn.proTxHash, quorumHash),
      masternode: mn,
    }))
    .sortBy('hash')
    .take(quorumSize)
    .value();
  if (deterministicMnList.every((dm) => dm.masternode.service !== masternode.service)) {
    return false;
  }

  return true;
};
