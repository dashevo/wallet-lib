const WalletLibError = require('./WalletLibError');


class InvalidRawTransaction extends WalletLibError {
  constructor(rawtx) {
    const getErrorMessageOf = () => 'InvalidRawTransaction';
    super(getErrorMessageOf((rawtx)));
  }
}

module.exports = InvalidRawTransaction;
