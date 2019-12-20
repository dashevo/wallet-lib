const CryptoJS = require('crypto-js');
const { AES } = CryptoJS;

const decrypt = function (method, data, secret) {
  const str = data === 'string' ? data : data.toString();
  switch (method) {
    default: // AES
      return AES.decrypt(str, secret).toString(CryptoJS.enc.Utf8);
  }
};
module.exports = decrypt;
