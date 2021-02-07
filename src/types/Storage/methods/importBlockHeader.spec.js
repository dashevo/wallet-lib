const {expect} = require('chai');
const importBlockHeader = require('./importBlockHeader');
const {BlockHeader} = require('@dashevo/dashcore-lib');
const blockheaders = [
  ["000000203ff9cabb94af363861e25efb20af3e3ff3cb4b4d74b058634ed9b681e001000090aeea4d32cc2af0e1581bfa857ec92d576c6a850ba016360495c13e0e71d3939d372060721c021ed1d70000", 440864],
  ["00000020716fc387353a10a7fa96313c0c4d2e9961115aa5166b65ab03f787d262000000d2727f82f3c07b3a06cc8ab4ad2b2d2b587c349e84ba038c0780200fb1d1c6ecef372060661b021e06f20000", 440865],
  ["000000206bd27ed18629d8248d96abfc35df9f12d4819efb9033bf180867b7efb2010000f3badd5d7a58bda5bf0110faba792e095d25bf7b74c3c30d60e6cf1fd269421342382060701d021eed740000", 440866],
  ["000000207c5555e0be42d75dce146ff12191689bba87808eeb6d99b6cf311be3b6010000d3f2ac26c878add6c559b57c7a329c11152faa850002d78c7a2f87af8648c38fc9382060ec18021e5cbb0000", 440867],
  ["0000002026b9d8782f5072960e1e3747be751f966a58d07c60907cf50611fb838e0000000125fb982bff2e2051721761e937bacc98879b51263242c866e9b3959d244db591392060ecfc011e1f4d0000", 440868],
  ["00000020824f369f4f3ce7bb540eed5b5bf860c52d1b628d22157cc82187912a0a000000863a79e51ff603e374b52e781f70b4a7ebcfa0115c3aa9f9357a00a2224d983dac392060ff0c021e2f000000", 440869],
  ["00000020da05110166b7f440315d30715276a94a97fc88373a89b2b832e7d3d5bb010000306704e86b48d66ad28e7fc43aa6d3068d0f64606b383652284ac3b22cb7f052cd392060ec06021ea18f0000", 440870]
]

const fakeState = {
  announce: ()=>{},
  network: 'testnet', store: {
    chains: {
      'testnet': {
        blockHeaders: {},
        mappedBlockHeaderHeights:{},
        blockHeight: -1,
        blockHash: null,
      }
    }
  }
};
describe('Storage - ImportBlockHeader', () => {
  it('should import a blockheader', () => {
    importBlockHeader.call(fakeState, new BlockHeader.fromString(blockheaders[1][0]), blockheaders[1][1]);
    expect(fakeState.store.chains.testnet.blockHeight).to.deep.equal(440865)
    expect(fakeState.store.chains.testnet.blockHash).to.deep.equal('000001b2efb7670818bf3390fb9e81d4129fdf35fcab968d24d82986d17ed26b')

  });
  it('should import multiple blockheaders', function () {
    importBlockHeader.call(fakeState, new BlockHeader.fromString(blockheaders[2][0]), blockheaders[2][1]);
    importBlockHeader.call(fakeState, new BlockHeader.fromString(blockheaders[3][0]), blockheaders[3][1]);
    importBlockHeader.call(fakeState, new BlockHeader.fromString(blockheaders[4][0]), blockheaders[4][1]);
    importBlockHeader.call(fakeState, new BlockHeader.fromString(blockheaders[5][0]), blockheaders[5][1]);
    importBlockHeader.call(fakeState, new BlockHeader.fromString(blockheaders[6][0]), blockheaders[6][1]);
    expect(fakeState.store.chains.testnet.blockHeight).to.deep.equal(440870)
  });
  it('should deal with importing a blockheader prior the last', function () {
    importBlockHeader.call(fakeState, new BlockHeader.fromString(blockheaders[0][0]), blockheaders[0][1]);
    expect(fakeState.store.chains.testnet.blockHeight).to.deep.equal(440870)
    expect(fakeState.store.chains.testnet.blockHash).to.deep.equal('0000005a38e319021ffaa1f4d1765d5f5a0e02e78ab488623a897c85240e2ca6')
    const hashes = blockheaders.map((el)=> new BlockHeader.fromString(el[0]).hash);

    // Sorting as we added [0] after all the other ones.
    expect(Object.keys(fakeState.store.chains.testnet.blockHeaders).sort()).to.deep.equal(hashes.sort());
  });
});
