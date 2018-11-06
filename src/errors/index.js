const is = require('../utils/is');

class WalletLibError extends Error {
  constructor(...params) {
    super(...params);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}


class UnknownDAP extends WalletLibError {}
class UnknownPlugin extends WalletLibError {}
class InjectionToPluginUnallowed extends WalletLibError {}
class InjectionErrorCannotInject extends WalletLibError {}
class InjectionErrorCannotInjectUnknownDependency extends WalletLibError {}
class ValidTransportLayerRequired extends WalletLibError {
  constructor(method, transportInfo = {}) {
    console.warn('------- Transport -----');
    console.warn('Triggered by ', method);
    console.warn('Transport status:', transportInfo);
    super();
  }
}
class TransactionNotInStore extends WalletLibError {}
class InvalidAddressObject extends WalletLibError {
  constructor(addressObject) {
    const getErrorMessageOf = (addressErrors) => {
      if (!is.arr(addressErrors) || addressErrors.length === 0) return false;
      const err = addressErrors[0];
      return `Address should have property ${err[0]} of type ${err[1]} ${JSON.stringify(addressObject)}`;
    };

    const evaluateAddressObjectError = (addrObj) => {
      const addressErrors = [];
      const expectedProps = [
        ['path', 'string'],
        ['address', 'addressObject'],
      ];
      const handledTypeVerification = Object.keys(is);
      expectedProps.forEach((prop) => {
        const key = prop[0];
        const type = prop[1];
        if (handledTypeVerification.includes(type)) {
          if (!is[type](addrObj[key])) {
            addressErrors.push(prop);
          }
        }
      });
      return addressErrors;
    };
    super(getErrorMessageOf(evaluateAddressObjectError(addressObject)));
  }
}
class InvalidTransaction extends WalletLibError {
  constructor(transactionObj) {
    const getErrorMessageOf = (transactionErrors) => {
      if (!is.arr(transactionErrors) || transactionErrors.length === 0) return false;
      const err = transactionErrors[0];
      return `Transaction should have property ${err[0]} of type ${err[1]}`;
    };

    const evaluateTransactionObjectError = (_txObj) => {
      const addressErrors = [];
      const expectedProps = [
        ['txid', 'txid'],
        ['vin', 'array'],
        ['vout', 'array'],
      ];
      const handledTypeVerification = Object.keys(is);
      expectedProps.forEach((prop) => {
        const key = prop[0];
        const type = prop[1];
        if (handledTypeVerification.includes(type)) {
          if (!is[type](_txObj[key])) {
            addressErrors.push(prop);
          }
        }
      });
      return addressErrors;
    };
    super(getErrorMessageOf(evaluateTransactionObjectError(transactionObj)));
  }
}
class InvalidUTXO extends WalletLibError {
  constructor(utxo) {
    const getErrorMessageOf = (utxoErrors) => {
      if (!is.arr(utxoErrors) || utxoErrors.length === 0) return false;
      const err = utxoErrors[0];
      return `UTXO should have property ${err[0]} of type ${err[1]}`;
    };

    const evaluateUTXOObjectError = (_utxo) => {
      const utxosErrors = [];
      const expectedProps = [
        ['txid', 'txid'],
        ['outputIndex', 'num'],
        ['satoshis', 'num'],
        ['scriptPubKey', 'string'],
      ];
      const handledTypeVerification = Object.keys(is);
      expectedProps.forEach((prop) => {
        const key = prop[0];
        const type = prop[1];
        if (handledTypeVerification.includes(type)) {
          if (!is[type](_utxo[key])) {
            utxosErrors.push(prop);
          }
        }
      });
      return utxosErrors;
    };
    super(getErrorMessageOf(evaluateUTXOObjectError(utxo)));
  }
}

module.exports = {
  WalletLibError,
  UnknownPlugin,
  InjectionToPluginUnallowed,
  UnknownDAP,
  InjectionErrorCannotInject,
  InjectionErrorCannotInjectUnknownDependency,
  ValidTransportLayerRequired,
  TransactionNotInStore,
  InvalidAddressObject,
  InvalidTransaction,
  InvalidUTXO,
};
