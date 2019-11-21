const { Networks } = require('@dashevo/dashcore-lib');

module.exports = (network) => Networks[network].toString() || Networks.testnet.toString();
