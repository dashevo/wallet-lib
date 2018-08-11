const { expect } = require('chai');
const {generateNewMnemonic, mnemonicToSeed} = require('../../src/utils/mnemonic');

describe('Utils - mnemonic', () => {
  it('should generate new mnemonic', () => {
    const result = generateNewMnemonic();
    expect(result.constructor.name).to.be.equal('Mnemonic');
  });
  it('should do mnemonicToSeed', () => {
    const mnemonic = generateNewMnemonic()
    const mnemonic2 = generateNewMnemonic().toString()
    const result = mnemonicToSeed(mnemonic);
    const result2 = mnemonicToSeed(mnemonic2);
    expect(result.constructor.name).to.be.equal('HDPrivateKey');
    expect(result2.constructor.name).to.be.equal('HDPrivateKey');
  });
});
