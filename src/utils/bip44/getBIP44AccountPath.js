const { Networks } = require('@dashevo/dashcore-lib');
const { BIP44_LIVENET_ROOT_PATH, BIP44_TESTNET_ROOT_PATH } = require('../../CONSTANTS');

function getBIP44AccountPath(accountIndex, network = 'testnet') {
  const path = (network === Networks.livenet.toString())
    ? `${BIP44_LIVENET_ROOT_PATH}/${accountIndex}'`
    : `${BIP44_TESTNET_ROOT_PATH}/${accountIndex}'`;

  return path;
}
module.exports = getBIP44AccountPath;
