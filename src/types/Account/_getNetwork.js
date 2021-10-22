const Dashcore = require('@dashevo/dashcore-lib');

module.exports = function getNetwork(network) {
  return Dashcore.Networks.get(network).toString() || Dashcore.Networks.testnet.toString();
};
