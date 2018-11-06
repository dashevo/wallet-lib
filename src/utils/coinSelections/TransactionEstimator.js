const _ = require('lodash');
const {
  Address, Script, Transaction,
} = require('@dashevo/dashcore-lib');

const { Input, Output } = Transaction;
const {
  FEES, VERSION_BYTES, TXOUT_DUFFS_VALUE_BYTES, N_LOCKTIME_BYTES,
} = require('../../CONSTANTS');
const is = require('../is');
const { varIntSizeBytesFromLength } = require('../varInt');

const calculateInputsSize = (inputs, tx) => {
  let inputsSize = 0;
  inputs.forEach((_input) => {
  // eslint-disable-next-line new-cap
    const output = new Output.fromObject({
      satoshis: _input.satoshis,
      script: _input.scriptPubKey,
    });
    const scriptSig = new Script(_input.scriptSig);

    const input = Input.fromObject({
      prevTxId: _input.txid,
      output,
      outputIndex: _input.outputIndex,
      script: scriptSig,
    });

    const inputBuff = input.toBufferWriter().toBuffer();
    const inputBytes = inputBuff.length;
    tx.addInput(input);

    inputsSize = +inputBytes;
  });

  return varIntSizeBytesFromLength(inputs.length) + inputsSize;
};
const calculateOutputsSize = (outputs, tx) => {
  let outputsBytes = 0;
  outputs.forEach((output) => {
    const pkScript = Script.buildPublicKeyHashOut(Address.fromString(output.address));
    const pkScriptSigBytes = pkScript.toBuffer().length;
    const pkScriptLengthBytes = varIntSizeBytesFromLength(pkScriptSigBytes);

    // eslint-disable-next-line new-cap
    tx.addOutput(new Output.fromObject({
      satoshis: output.satoshis,
      script: pkScript,
    }));

    outputsBytes += (TXOUT_DUFFS_VALUE_BYTES
      + pkScriptLengthBytes
      + pkScriptSigBytes);
  });
  return varIntSizeBytesFromLength(outputs.length) + outputsBytes;
};

const defaultOpts = {
  scriptType: 'P2PKH', // We only support that for now;
};
class TransactionEstimator {
  constructor() {
    this.state = {
      outputs: [],
      inputs: [],
    };
  }

  getOutputs() {
    return this.state.outputs;
  }

  getInputs() {
    return this.state.inputs;
  }

  getInValue() {
    return this.state.inputs.reduce((prev, curr) => prev + curr.satoshis, 0);
  }

  getOutValue() {
    return this.state.outputs.reduce((prev, curr) => prev + curr.satoshis, 0);
  }

  addInputs(_inputs = []) {
    const self = this;
    const inputs = (is.arr(_inputs)) ? _inputs : [_inputs];
    if (inputs.length < 1) return false;

    const addInputs = (input) => {
      if (!_.has(input, 'script') && !_.has(input,'scriptPubKey')) throw new Error('Expected script to add input');
      self.state.inputs.push(input);
    };

    inputs.forEach(addInputs);
    return inputs;
  }

  addOutputs(_outputs = []) {
    const self = this;
    const outputs = (is.arr(_outputs)) ? _outputs : [_outputs];
    if (outputs.length < 1) return false;

    const addOutput = (output) => {
      if (!_.has(output, 'scriptType')) {
        // eslint-disable-next-line no-param-reassign
        output.scriptType = defaultOpts.scriptType;
      }
      self.state.outputs.push(output);
    };

    outputs.forEach(addOutput);
    return outputs;
  }

  getSize() {
    const tx = new Transaction();

    let size = 0;
    size += VERSION_BYTES;
    size += calculateInputsSize(this.state.inputs, tx);
    size += calculateOutputsSize(this.state.outputs, tx);
    size += N_LOCKTIME_BYTES;

    return size;
  }

  getTotalOutputValue() {
    let totalValue = 0;
    this.state.outputs.forEach((output) => {
      totalValue += output.satoshis;
    });
    return totalValue;
  }

  getFeeEstimate() {
    return this.estimateFees();
  }

  estimateFees() {
    const bytesSize = this.getSize();
    return (bytesSize / 1000 * FEES.NORMAL);
  }

  debug() {
    console.log('=== Transaction Estimator');
    console.log('State:', this.state);
    console.log('Size', this.getSize());
    console.log('Fees', this.estimateFees());
    console.log('=========================');
  }
}
module.exports = TransactionEstimator;
