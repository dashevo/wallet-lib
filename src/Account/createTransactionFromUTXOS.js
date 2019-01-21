const _ = require('lodash');
const Dashcore = require('@dashevo/dashcore-lib');
const { is, coinSelection } = require('../utils');
const { CreateTransactionError } = require('../errors');

/**
 * Create a transaction based around a provided utxos
 * @param opts - Options object
 * @param opts.utxos - Array - A utxo set
 * @param opts.recipient - String - A valid Dash address
 * @param opts.amount - number - Optional, satoshi value
 * @param opts.deductFee - bool - Optional - Default : true
 * @param opts.isInstantSend - bool - Optional - Default : false
 * @return {string}
 */
function createTransactionFromUTXOS(opts) {
  const tx = new Dashcore.Transaction();
  if (!opts || (!opts.utxos) || opts.utxos.length === 0) {
    throw new Error('A utxos set is needed');
  }
  if (!opts || (!opts.recipient)) {
    throw new Error('A recipient is expected to create a transaction');
  }
  const { recipient, utxos } = opts;

  // eslint-disable-next-line no-underscore-dangle
  // console.log(utxos.map(utxo => utxo.satoshis).reduce((a,b)=>a+=b));
  const amount = (is.num(opts.amount))
    ? opts.amount
    : utxos.map(utxo => utxo.satoshis).reduce((acc, curr) => acc + curr);

  const deductFee = _.has(opts, 'deductFee')
    ? opts.deductFee
    : true;

  const feeCategory = (opts.isInstantSend) ? 'instant' : 'normal';
  let selection;
  try {
    selection = coinSelection(utxos, [{
      address: recipient,
      satoshis: amount,
    }], deductFee, feeCategory);
  } catch (e) {
    throw new CreateTransactionError(e);
  }

  // We parse our inputs, transform them into a Dashcore UTXO object.
  const inputs = selection.utxos.reduce((accumulator, current) => {
    const unspentoutput = new Dashcore.Transaction.UnspentOutput(current);
    accumulator.push(unspentoutput);

    return accumulator;
  }, []);

  tx.from(inputs);
  tx.to(selection.outputs);

  tx.change(recipient);
  tx.fee(selection.estimatedFee);

  const addressList = utxos.map(el => Dashcore.Script
    .fromHex(el.scriptPubKey)
    .toAddress(this.network)
    .toString());

  const privateKeys = _.has(opts, 'privateKeys')
    ? opts.privateKeys
    : this.getPrivateKeys(addressList);

  const signedTx = this.keyChain.sign(tx, privateKeys, Dashcore.crypto.Signature.SIGHASH_ALL);
  return signedTx.toString();
}

module.exports = createTransactionFromUTXOS;
