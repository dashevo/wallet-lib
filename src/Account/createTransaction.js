const _ = require('lodash');
const Dashcore = require('@dashevo/dashcore-lib');
const { CreateTransactionError } = require('../errors');
const { dashToDuffs, coinSelection } = require('../utils');
/**
 * Create a transaction based around on the provided information
 * @param opts - Options object
 * @param opts.amount - Amount in dash that you want to send
 * @param opts.satoshis - Amount in satoshis
 * @param opts.recipient - Address of the recipient
 * @param opts.isInstantSend - If you want to use IS or stdTx.
 * @param opts.deductFee - Deduct fee
 * @param opts.privateKeys - Overwrite default behavior : auto-searching local matching keys.
 * @param opts.privateKeys - Overwrite default behavior : auto-searching local matching keys.
 * @return {String} - rawTx
 */
function createTransaction(opts) {
  const self = this;
  const tx = new Dashcore.Transaction();

  if (!opts || (!opts.amount && !opts.satoshis)) {
    throw new Error('An amount in dash or in satoshis is expected to create a transaction');
  }
  const satoshis = (opts.amount && !opts.satoshis) ? dashToDuffs(opts.amount) : opts.satoshis;
  if (!opts || (!opts.recipient)) {
    throw new Error('A recipient is expected to create a transaction');
  05}
  const deductFee = _.has(opts, 'deductFee')
    ? opts.deductFee
    : true;

  const outputs = [{ address: opts.recipient, satoshis }];

  const utxosList = this.getUTXOS();

  utxosList.map((utxo) => {
    const utxoTx = self.storage.searchTransaction(utxo.txid);
    if (utxoTx.found) {
      // eslint-disable-next-line no-param-reassign
      // console.log(utxoTx.result.vin);
      // utxo.scriptSig = utxoTx.result.vin[0].scriptSig.hex;
    }
    return utxo;
  });

  const feeCategory = (opts.isInstantSend) ? 'instant' : 'PRIORITY';
  let selection;
  try {
    selection = coinSelection(utxosList, outputs, deductFee, feeCategory);
  } catch (e) {
    throw new CreateTransactionError(e);
  }

  const selectedUTXOs = selection.utxos;
  const selectedOutputs = selection.outputs;
  const {
    // feeCategory,
    estimatedFee,
  } = selection;

  tx.to(selectedOutputs);


  // We parse our inputs, transform them into a Dashcore UTXO object.
  const inputs = selectedUTXOs.reduce((accumulator, current) => {
    const unspentoutput = new Dashcore.Transaction.UnspentOutput(current);
    accumulator.push(unspentoutput);

    return accumulator;
  }, []);

  if (!inputs) return tx;
  // We can now add direction our inputs to the Dashcore TX object
  tx.from(inputs);

  // In case or excessive fund, we will get that to an address in our possession
  const addressChange = this.getUnusedAddress('internal', 1).address;
  tx.change(addressChange);


  // TODO : Deduct fee operation should happen here ?

  // const feeRate = (opts.isInstantSend) ? feeCalculation('instantSend') : feeCalculation();
  // if (feeRate.type === 'perBytes') {
  // console.log(feeRate.value * tx.size)
  // tx.feePerKb(feeRate.value * 10);
  // tx.fee(FEES.DEFAULT_FEE);
  // }
  // if (feeRate.type === 'perInputs') {
  //   const fee = inputs.length * FEES.NORMAL;
  //   tx.fee(fee);
  // }
  tx.fee(estimatedFee);
  const addressList = selectedUTXOs.map(el => ((el.address)));
  const privateKeys = _.has(opts, 'privateKeys')
    ? opts.privateKeys
    : this.getPrivateKeys(addressList);
  const transformedPrivateKeys = [];
  privateKeys.forEach((pk) => {
    if (pk.constructor.name === 'PrivateKey') {
      transformedPrivateKeys.push(pk);
    } else if (pk.constructor.name === 'HDPrivateKey') transformedPrivateKeys.push(pk.privateKey);
    else {
      console.log('Unexpected pk type', pk, pk.constructor.name);
    }
  });
  try {
    const signedTx = this.keyChain.sign(
      tx,
      transformedPrivateKeys,
      Dashcore.crypto.Signature.SIGHASH_ALL,
    );
    // console.log(signedTx.verify())
    return signedTx.toString();
  } catch (e) {
    // if (e.message === 'Not fully signed transaction') {}
    return e;
  }
}
module.exports = createTransaction;
