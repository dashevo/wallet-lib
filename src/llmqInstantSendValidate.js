const { chain } = require('lodash');
const { hash } = require('./utils/crypto');

// https://github.com/dashpay/dips/blob/master/dip-0006.md

// Each receiver of a contribution message must first perform
// some basic validation of the message on receival. These include:

// 1. The quorumHash must match the current DKG session
// 2. The proTxHash must belong to a member of the LLMQ
// 3. The verification vector must have exactly as many entries as the configured quorumThreshold
// 4. The verification vector should not have any duplicates
// 5. The number of secret key contributions must match the total quorum size
// 6. The signature of the message must be valid and
//    signed with the operator key of the contributing masternode

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
}
