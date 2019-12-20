const AES = require('crypto-js/aes');

const encrypt = function (method, data, secret) {
  const str = data === 'string' ? data : data.toString();
  switch (method) {
    default: // AES
      return AES.encrypt(str, secret);
  }
};
module.exports = encrypt;
