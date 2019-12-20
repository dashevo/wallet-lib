const { expect } = require('chai');
const {
  generateNewMnemonic,
  seedToHDPrivateKey,
  mnemonicToHDPrivateKey,
  mnemonicToWalletId,
  mnemonicToSeed,
} = require('../../src/utils/mnemonic');
const is = require('../../src/utils/is');

const mnemonic1 = 'hole lesson insane entire dolphin scissors game dwarf polar ethics drip math';
const mnemonic2 = 'woman forest output essay bleak satisfy era ordinary exotic source portion wire';
const mnemonic3 = 'divorce radar castle wire sun timber master income exchange wash fluid loud';
const mnemonic4 = 'increase table banana fiscal innocent wool sport mercy motion stable prize promote';

const passSeed1 = 'superpassphrase';
const expectedSeed1 = '436905e6756c24551bffaebe97d0ebd51b2fa027e838c18d45767bd833b02a80a1dd55728635b54f2b1dbed5963f4155e160ee1e96e2d67f7e8ac28557d87d96';
const expectedPassSeed1 = 'f637c95a551647f3f49c707c2f40ea0ee38a70995ab108004529af55ea43bcf02c6bcb156f8750e6b4188ac1f0955505173336a1a1b579fe970071b0014be44c';
const expectedPrivate1Mainnet = 'xprv9s21ZrQH143K3hVMJ7XzM4uiV1PndeSqGVzowkGjRpnSesDkmb3p5iGp8scGgAPjLw8Z3WZZr2BcbN2kfzqSYRG3VKSQgSszEdijEoWSDAC';
const expectedPrivate1Testnet = 'tprv8ZgxMBicQKsPeWisxgPVWiXho8ozsAUqc3uvpAhBuoGvSTxqkxPZbTeG43mvgXn3iNfL3cBL1NmR4DaVoDBPMUXe1xeiLoc39jU9gRTVBd2';

describe('Utils - mnemonic', () => {
  it('should generate new mnemonic', () => {
    const result = generateNewMnemonic();
    expect(result.constructor.name).to.be.equal('Mnemonic');
  });
  it('should do mnemonicToHDPrivateKey', () => {
    const mnem1 = generateNewMnemonic();
    const mnem2 = generateNewMnemonic().toString();
    const result = mnemonicToHDPrivateKey(mnem1);
    const result2 = mnemonicToHDPrivateKey(mnem2);
    expect(result.constructor.name).to.be.equal('HDPrivateKey');
    expect(result2.constructor.name).to.be.equal('HDPrivateKey');
  });
  it('should do mnemonicToWalletId', () => {
    const mnem1 = generateNewMnemonic();
    const result = mnemonicToWalletId(mnem1);
    expect(result.constructor.name).to.be.equal('String');
    expect(result.length).to.be.equal(10);
    expect(is.hex(result)).to.be.equal(true);

    expect(mnemonicToWalletId(mnemonic1)).to.equal('f566600d81');
    expect(mnemonicToWalletId(mnemonic2)).to.equal('74bbe91a47');
    expect(mnemonicToWalletId(mnemonic3)).to.equal('f351a836e6');
    expect(mnemonicToWalletId(mnemonic4)).to.equal('fad183cbf7');

    expect(() => mnemonicToWalletId()).to.throw('Expect mnemonic to be provided');
    expect(() => mnemonicToHDPrivateKey()).to.throw('Expect mnemonic to be provided');
  });
  it('should do mnemonicToSeed', () => {
    expect(mnemonicToSeed(mnemonic1)).to.equal(expectedSeed1);
    expect(mnemonicToSeed(mnemonic1, passSeed1)).to.equal(expectedPassSeed1);
  });
  it('should do seedToHDPrivateKey', () => {
    expect(seedToHDPrivateKey(expectedSeed1).toString()).to.equal(expectedPrivate1Testnet);
    expect(seedToHDPrivateKey(expectedSeed1, 'mainnet').toString()).to.equal(expectedPrivate1Mainnet);
  });
});
