const { expect } = require('chai');
const { Networks } = require('@dashevo/dashcore-lib');
const {
  dashToDuffs,
  duffsToDash,
  generateNewMnemonic,
  mnemonicToSeed,
} = require('../../src/utils/index');
const { mnemonicString1, HDPrivateKey1Testnet } = require('../fixtures');

describe('Utils', () => {
  it('should handle dash2Duff', () => {
    expect(dashToDuffs(2000)).to.equal(200000000000);
    expect(dashToDuffs(-2000)).to.equal(-200000000000);
    expect(() => dashToDuffs('deuxmille')).to.throw('Can only convert a number');
  });
  it('should handle duff2Dash', () => {
    expect(duffsToDash(200000000000)).to.equal(2000);
    expect(duffsToDash(-200000000000)).to.equal(-2000);
    expect(() => duffsToDash('deuxmille')).to.throw('Can only convert a number');
  });
  it('should generate a mnemonic', () => {
    const mnemonic = generateNewMnemonic();
    expect(mnemonic).to.be.a('object');
    expect(mnemonic.toString()).to.be.a('string');
  });
  it('should convert mnemonic to seed', () => {
    const network = Networks.testnet;
    const seed = mnemonicToSeed(mnemonicString1, network);
    expect(seed).to.be.a('object');
    expect(seed.toString()).to.equal(HDPrivateKey1Testnet);
  });
});
