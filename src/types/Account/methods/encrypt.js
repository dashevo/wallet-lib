const AES = require('crypto-js/aes');

module.exports = (data, secret) => AES.encrypt(
  typeof data === 'string' ? data : data.toString(),
  secret,
).toString();
