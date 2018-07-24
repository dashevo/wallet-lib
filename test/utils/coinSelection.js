const coinSelection = require('../../src/utils/coinSelection');
const outputHandler = require('../../src/utils/outputHandler');
const { expect } = require('chai');

describe('Utils - coinSelection', () => {
  it('should get a coinSelection with default value', () => {
    const utxosList = [{
      address: 'yeuLv2E9FGF4D9o8vphsaC2Vxoa8ZA7Efp',
      txid: 'e66474bfe8ae3d91b2784864fc09e0bd615cbfbf4a2164e46b970bcc488a938f',
      vout: 1,
      scriptPubKey: '76a914cbdb740680e713c141e9fb32e92c7d90a3f3297588ac',
      amount: 49.9999,
      satoshis: 4999990000,
      height: 142810,
      confirmations: 50651,
    }];
    const outputs = outputHandler([{
      amount: 9.9999,
      address: 'yeuLv2E9FGF4D9o8vphsaC2Vxoa8ZA7Efp',
      scriptPubKey: '76a914cbdb740680e713c141e9fb32e92c7d90a3f3297588ac',
    }]);

    const result = coinSelection(utxosList, outputs);
    const expectedResult = {};
    expect(result).to.deep.equal(expectedResult);
  });

});
