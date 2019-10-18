const { PrivateKey } = require('@dashevo/dashcore-lib');

module.exports = () => new PrivateKey().toString();
