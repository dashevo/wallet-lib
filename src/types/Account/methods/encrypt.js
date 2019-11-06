const AES = require('crypto-js/aes');
const cbor = require('cbor');

module.exports = (method, data, secret) => {
  const str = data === 'string' ? data : data.toString();
  switch (method) {
    case 'cbor':
      return cbor.encode(str);

    default: // AES
      return AES.encrypt(str, secret);
  }
};
