const { has } = require('lodash');
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
  constructor(method) {
    super(`A transport layer is needed to perform a ${method}`);
  }
}
class TransactionNotInStore extends WalletLibError {
  constructor(txid) {
    const getErrorMessageOf = () => `Transaction is not in store : ${txid} `;

    super(getErrorMessageOf((txid)));
  }
}
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
      const txid = has(transactionObj, 'txid') ? transactionObj.txid : 'unknown';
      return `Transaction txid: ${txid} should have property ${err[0]} of type ${err[1]}`;
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
          if ((!has(_txObj, key) || !is[type](_txObj[key]))) {
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
      const txid = (has(utxo, 'txid')) ? utxo.txid : 'unknown';
      return `UTXO txid:${txid} should have property ${err[0]} of type ${err[1]}`;
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
class InvalidRawTransaction extends WalletLibError {
  constructor(rawtx) {
    const getErrorMessageOf = () => 'InvalidRawTransaction';
    super(getErrorMessageOf((rawtx)));
  }
}

class InvalidOutput extends WalletLibError {
  constructor(output) {
    const getErrorMessageOf = (utxoErrors) => {
      if (!is.arr(utxoErrors) || utxoErrors.length === 0) return false;
      const err = utxoErrors[0];
      const txid = (has(output, 'txid')) ? output.txid : 'unknown';
      const address = (has(output, 'address')) ? output.address : 'unknown';
      return `Output txid:${txid} address: ${address} should have property ${err[0]} of type ${err[1]}`;
    };

    const evaluateUTXOObjectError = (_utxo) => {
      const utxosErrors = [];
      const expectedProps = [
        ['address', 'string'],
        ['satoshis', 'num'],
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
    super(getErrorMessageOf(evaluateUTXOObjectError(output)));
  }
}

class CoinSelectionUnsufficientUTXOS extends WalletLibError {
  constructor(info) {
    const getErrorMessageOf = (_info) => {
      const { utxosValue, outputValue } = _info;
      const diff = utxosValue - outputValue;
      return `Unsufficient utxos (${utxosValue}) to cover the output : ${outputValue}. Diff : ${diff}`;
    };
    super(getErrorMessageOf(info));
  }
}
class CreateTransactionError extends WalletLibError {
  constructor(e) {
    if (e instanceof CoinSelectionUnsufficientUTXOS) {
      super('Unsufficient funds to cover the output');
    } else {
      super(e);
    }
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
  InvalidRawTransaction,
  InvalidUTXO,
  InvalidOutput,
  CreateTransactionError,
  CoinSelectionUnsufficientUTXOS,
};
