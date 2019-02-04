const { expect } = require('chai');
const coinSelection = require('../../src/utils/coinSelection');
const { utxosList } = require('../fixtures/crackspice');
const STRATEGIES = require('../../src/utils/coinSelections/strategies');

const outputs = {
  ONE_DASH: {
    satoshis: 100000000,
    address: 'ybefxSHaEbDATvq5gVCxjV375NWus3ttV7',
  },
  HUNDRED_DASH: {
    satoshis: 10000000000,
    address: 'ybefxSHaEbDATvq5gVCxjV375NWus3ttV7',
  },
  TWENTY_FIVE_DASH: {
    satoshis: 2500000000,
    address: 'ybefxSHaEbDATvq5gVCxjV375NWus3ttV7',
  },
  FOURTY_FIVE_DASH: {
    satoshis: 4500000000,
    address: 'ybefxSHaEbDATvq5gVCxjV375NWus3ttV7',
  },
  MILLION_DASH: {
    satoshis: 100000000000000,
    address: 'ybefxSHaEbDATvq5gVCxjV375NWus3ttV7',
  },
};
describe('Utils - coinSelection', () => {
  it('should require a utxosList', () => {
    expect(() => coinSelection()).to.throw('A utxosList is required');
  });
  it('should require a utxosList as an array', () => {
    expect(() => coinSelection({})).to.throw('UtxosList is expected to be an array of utxos');
  });
  it('should require a utxosList with at least one utxo', () => {
    expect(() => coinSelection([])).to.throw('utxosList must contain at least 1 utxo');
  });

  it('should require a utxosList with valid utxo', () => {
    expect(() => coinSelection([{
      toto: true,
    }])).to.throw('UTXO txid:unknown should have property txid of type txid');
  });


  it('should require a outputsList', () => {
    expect(() => coinSelection(utxosList)).to.throw('An outputsList is required in order to perform a selection');
  });
  it('should require a outputsList as an array', () => {
    expect(() => coinSelection(utxosList, {})).to.throw('outputsList must be an array of outputs');
  });
  it('should require a outputsList with at least one output', () => {
    expect(() => coinSelection(utxosList, [])).to.throw('outputsList must contains at least 1 output');
  });

  it('should require a outputsList with valid outputs', () => {
    expect(() => coinSelection(utxosList, [{ toto: true }])).to.throw('Output txid:unknown address: unknown should have property address of type string');
  });
  it('should alert if the total amount is not enought', () => {
    expect(() => coinSelection(utxosList, [outputs.HUNDRED_DASH])).to.throw('Unsufficient utxos (7099960000) to cover the output : 10000000000. Diff : -2900040000');
  });
  it('should get a coinSelection for 1 dash', () => {
    const result = coinSelection(utxosList, [outputs.ONE_DASH], false, 'normal', STRATEGIES.simpleDescendingAccumulator );
    const expectedResult = {
      utxos: [{
        address: 'yNgqjoW69ouSivtBMNFRCG5zSG85nyxW3d', txid: '36820d7268090d6f315eef03b28b7b2b2097c8b067608f652612a2c4612a6697', outputIndex: 1, scriptPubKey: '76a91419fc1815a04c42a849a7a6dda826c67478514fed88ac', amount: 9.9999, satoshis: 999990000, height: 203208,
      }],
      outputs: [{ satoshis: 100000000, address: 'ybefxSHaEbDATvq5gVCxjV375NWus3ttV7', scriptType: 'P2PKH' }],
      feeCategory: 'normal',
      estimatedFee: 205,
      utxosValue: 999990000,
    };


    expect(result).to.deep.equal(expectedResult);
  });
  it('should handle a case when using more than 25 utxos', () => {
    const result = coinSelection(utxosList, [outputs.TWENTY_FIVE_DASH], false, 'normal', STRATEGIES.simpleDescendingAccumulator );
    const expectedResult = {
      utxos: [{
        address: 'yNgqjoW69ouSivtBMNFRCG5zSG85nyxW3d', txid: '36820d7268090d6f315eef03b28b7b2b2097c8b067608f652612a2c4612a6697', outputIndex: 1, scriptPubKey: '76a91419fc1815a04c42a849a7a6dda826c67478514fed88ac', amount: 9.9999, satoshis: 999990000, height: 203208,
      }, {
        address: 'yPWVEG3mW8pFdPCXcE53gN1fSTM8dkV7kF', txid: '2911362650f08df1ea16e03973bb41e1ee33680cce2ec6ce864e2daf35431e08', outputIndex: 1, scriptPubKey: '76a91422fef09d745700a159553dd42227895053d33e6888ac', amount: 8.4999, satoshis: 849990000, height: 203251,
      }, {
        address: 'yPn5VvPk7ioN9emDv3MkCKovpjNqSLwW1p', txid: '96eb6c951d69a3b8703673ca0d588cf6cee528f866fc598e84205ddcc34ea100', outputIndex: 1, scriptPubKey: '76a91425f1c9581cd2a9976e6ace867f8e895663e6825a88ac', amount: 6.9998, satoshis: 699980000, height: 201738,
      }],
      outputs: [{ satoshis: 2500000000, address: 'ybefxSHaEbDATvq5gVCxjV375NWus3ttV7', scriptType: 'P2PKH' }],
      feeCategory: 'normal',
      estimatedFee: 495,
      utxosValue: 2549960000,
    };


    expect(result).to.deep.equal(expectedResult);
  });
  it('should handle a case when using more than 45 utxos', () => {
    const result = coinSelection(utxosList, [outputs.FOURTY_FIVE_DASH], false, 'normal', STRATEGIES.simpleDescendingAccumulator );
    const expectedResult = {
      utxos: [{
        address: 'yNgqjoW69ouSivtBMNFRCG5zSG85nyxW3d', txid: '36820d7268090d6f315eef03b28b7b2b2097c8b067608f652612a2c4612a6697', outputIndex: 1, scriptPubKey: '76a91419fc1815a04c42a849a7a6dda826c67478514fed88ac', amount: 9.9999, satoshis: 999990000, height: 203208,
      }, {
        address: 'yPWVEG3mW8pFdPCXcE53gN1fSTM8dkV7kF', txid: '2911362650f08df1ea16e03973bb41e1ee33680cce2ec6ce864e2daf35431e08', outputIndex: 1, scriptPubKey: '76a91422fef09d745700a159553dd42227895053d33e6888ac', amount: 8.4999, satoshis: 849990000, height: 203251,
      }, {
        address: 'yPn5VvPk7ioN9emDv3MkCKovpjNqSLwW1p', txid: '96eb6c951d69a3b8703673ca0d588cf6cee528f866fc598e84205ddcc34ea100', outputIndex: 1, scriptPubKey: '76a91425f1c9581cd2a9976e6ace867f8e895663e6825a88ac', amount: 6.9998, satoshis: 699980000, height: 201738,
      }, {
        address: 'yb34xdJMT2mCrJdkawEti7ZnoYXZ5rpBUJ', txid: 'e092395f069fbc62e4e88df6a962833a26ffb6f8f6fe984c70e23a47d406ac89', outputIndex: 1, scriptPubKey: '76a914a170f58a73fd56a8cf3e36015df98078d37e842488ac', amount: 5, satoshis: 500000000, height: 201382,
      }, {
        address: 'yW5qRPWdp1NzvxPbE4v95FDCxjxNqDEi42', txid: '5b14eea2e1e07f94fbce22b50b6cda6b748a66c1119524a623c6820b75bbc7ca', outputIndex: 0, scriptPubKey: '76a9146b1e46d3f3d559dda4468cc30a7b612705eb810f88ac', amount: 5, satoshis: 500000000, height: 203286,
      }, {
        address: 'yYNZYgZrCVHQkJ4sPbmegb768zLaoAtREb', txid: 'deceb521c45d78cfd85bfb2462595a39e10da232768fb61295229923bf265c2a', outputIndex: 1, scriptPubKey: '76a914843859336f31e96025afc658bf152fb0b0bb751188ac', amount: 4, satoshis: 400000000, height: 203313,
      }, {
        address: 'yW5qRPWdp1NzvxPbE4v95FDCxjxNqDEi42', txid: '2bf25390be738308827348711da2700918b73096bfaff99de6c9c60121fa5d8e', outputIndex: 0, scriptPubKey: '76a9146b1e46d3f3d559dda4468cc30a7b612705eb810f88ac', amount: 2, satoshis: 200000000, height: 203268,
      }, {
        address: 'yW5qRPWdp1NzvxPbE4v95FDCxjxNqDEi42', txid: 'dd02316f28e6d04f1f6f998c30f367dee4dc820309a6cd3cdfc436dc63254c50', outputIndex: 1, scriptPubKey: '76a9146b1e46d3f3d559dda4468cc30a7b612705eb810f88ac', amount: 2, satoshis: 200000000, height: 203276,
      }, {
        address: 'yMfDnWF6piqNA7mbSeEeAP4LiiqgxkJvNL', txid: '96eb6c951d69a3b8703673ca0d588cf6cee528f866fc598e84205ddcc34ea100', outputIndex: 0, scriptPubKey: '76a9140eb58a39a96968c19411568752ecdecf55dabb8588ac', amount: 2, satoshis: 200000000, height: 201738,
      }],
      outputs: [{ satoshis: 4500000000, address: 'ybefxSHaEbDATvq5gVCxjV375NWus3ttV7', scriptType: 'P2PKH' }],
      feeCategory: 'normal',
      estimatedFee: 1365,
      utxosValue: 4549960000,
    };


    expect(result).to.deep.equal(expectedResult);
  });
  // Note : Removed, kept in case of fallback needed
  // it('should return an error in not any utxo has been found', () => {
  //   const utxo = utxosList[15];
  //   const utxos = [];
  //   for (let i = 0; i <= 45; i++) {
  //     utxos.push(utxosList[15]);
  //   }
  // expect(() => coinSelection(utxos, [outputs.FOURTY_FIVE_DASH])).to.throw('Did not found any utxo, missing implementation of this case');
  // });
});
