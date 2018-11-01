const _ = require("lodash");
const {Address, Script, Transaction, crypto, PrivateKey} = require('@dashevo/dashcore-lib');
const {Input, Output} = Transaction;
const Signature = crypto.Signature;
const {FEES} = require('../../Constants');
const is = require('../is');
const {varIntSizeBytesFromLength} = require('../varInt');

const TXIN_PREV_OUTPUTS_BYTES = 36;
const TXIN_SEQUENCE_BYTES = 4;
const TXOUT_DUFFS_VALUE_BYTES = 8;
const VERSION_BYTES = 4;
const N_LOCKTIME_BYTES = 4;


const accumulator = {
  utxos:{
    available:0,
    selected:0,
    valueIn:0
  },
  outputs:{
    list:[],
    size:0,
    valueOut:0
  },
  fees:{
    category: 'normal',
    deductFee: false,
    outputFee:0
  }
}

const calculateInputsSize = (inputs, tx)=>{
  let inputsSize = 0;
  inputs.forEach((_input)=>{
    const output = new Output.fromObject({
      satoshis: _input.satoshis,
      script:_input.script
    });
    const scriptSig = new Script(_input.scriptSig);

    const input = Input.fromObject({
      prevTxId:_input.txId,
      output,
      outputIndex:_input.outputIndex,
      script:scriptSig
    });

    const inputBuff = input.toBufferWriter().toBuffer();
    const inputBytes = inputBuff.length;
    tx.addInput(input);

    inputsSize =+ inputBytes
  });

  return varIntSizeBytesFromLength(inputs.length) + inputsSize;
}
const calculateOutputsSize = (outputs,tx)=>{
  let outputsBytes = 0;
  outputs.forEach((output)=>{
    const pkScript = Script.buildPublicKeyHashOut(Address.fromString(output.address));
    const pkScriptSigBytes = pkScript.toBuffer().length;
    const pkScriptLengthBytes = varIntSizeBytesFromLength(pkScriptSigBytes);

    tx.addOutput(new Output.fromObject({
      satoshis: output.satoshis,
      script: pkScript
    }));

    outputsBytes += (TXOUT_DUFFS_VALUE_BYTES
      + pkScriptLengthBytes
      + pkScriptSigBytes);
  });
  return varIntSizeBytesFromLength(outputs.length) + outputsBytes;
}

const defaultOpts = {
  scriptType: 'P2PKH' //We only support that for now;
}
class TransactionEstimator {
  constructor(){
    this.state = {
      outputs:[],
      inputs:[]
    };
  }
  getOutputs(){
    return this.state.outputs;
  }
  getInputs(){
    return this.state.inputs;
  }
  getInValue(){
    return this.state.inputs.reduce((prev, curr)=> {return prev + curr.satoshis},0);

  }
  getOutValue(){
    return this.state.outputs.reduce((prev, curr)=> {return prev + curr.satoshis},0);
  }
  addInputs(_inputs = []){
    const self = this;
    const inputs = (is.arr(_inputs)) ? _inputs : [_inputs];
    if(inputs.length<1) return false;

    const addInputs = (input) =>{
      if(!_.has(input, 'script')) throw new Error('Expected script to add input');
      self.state.inputs.push(input);
    };

    inputs.forEach(addInputs)
  }
  addOutputs(_outputs = []){
    const self = this;
    const outputs = (is.arr(_outputs)) ? _outputs : [_outputs];
    if(outputs.length<1) return false;

    const addOutput = (output) =>{

      if(!_.has(output, 'scriptType')){
        output.scriptType = defaultOpts.scriptType;
      }
      self.state.outputs.push(output);
    };

    outputs.forEach(addOutput)
  }
  getSize(){
    const self = this;

    const tx = new Transaction();

    let size = 0;
    size += VERSION_BYTES;
    size += calculateInputsSize(this.state.inputs,tx);
    size += calculateOutputsSize(this.state.outputs,tx);
    size += N_LOCKTIME_BYTES;

    return size;
  }
  getTotalOutputValue(){
    let totalValue = 0;
    this.state.outputs.forEach((output)=>{
      totalValue+=output.satoshis;
    });
    return totalValue;
  }
  getFeeEstimate(){
    return this.estimateFees();
  }
  estimateFees(){
    const bytesSize = this.getSize();
    return (bytesSize/1000 * FEES.NORMAL);
  }
  debug(){
    console.log('=== Transaction Estimator');
    console.log('State:', this.state);
    console.log('Size', this.getSize());
    console.log('Fees', this.estimateFees());
    console.log('=========================');

  }
}
module.exports = TransactionEstimator;