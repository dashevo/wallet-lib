const { expect } = require('chai');
const { Networks } = require('@dashevo/dashcore-lib');
const {
  dashToDuffs,
  duffsToDash,
  generateNewMnemonic,
  mnemonicToSeed,
  is,
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
  it('should throw error when mnemonic is not provided in mnemonicToSeed', () => {
    const network = Networks.testnet;
    expect(() => mnemonicToSeed('', network)).to.throw('Expect mnemonic to be provide');
  });
  it('should is.num handle numbers', () => {
    expect(is.num(100)).to.be.equals(true);
  });
  it('should is.num handle not numbers', () => {
    expect(is.num('100')).to.be.equals(false);
  });
  it('should is.arr handle empty arr', () => {
    expect(is.arr([])).to.be.equals(true);
  });
  it('should is.arr handle arr', () => {
    expect(is.arr([1, 'b'])).to.be.equals(true);
  });
  it('should is.arr handle not array(dict)', () => {
    expect(is.arr({ 100: 'b' })).to.be.equals(false);
  });
  it('should is.arr handle not array(str)', () => {
    expect(is.arr('str')).to.be.equals(false);
  });
  it('should is.float handle int', () => {
    expect(is.float(100)).to.be.equals(false);
  });
  it('should is.float handle float with .0(not float)', () => {
    expect(is.float(100.0)).to.be.equals(false);
  });
  it('should is.float handle float', () => {
    expect(is.float(100.2)).to.be.equals(true);
  });
  it('should is.float handle not float(str)', () => {
    expect(is.num('100')).to.be.equals(false);
  });

  it('should is.int handle int', () => {
    expect(is.int(100)).to.be.equals(true);
  });
  it('should is.int handle zero', () => {
    expect(is.int(0)).to.be.equals(true);
  });
  it('should is.int handle negative int', () => {
    expect(is.int(-1)).to.be.equals(true);
  });

  it('should is.int handle float with .0', () => {
    expect(is.int(100.0)).to.be.equals(true);
  });
  it('should is.int handle float', () => {
    expect(is.int(100.2)).to.be.equals(false);
  });
  it('should is.int handle not float(str)', () => {
    expect(is.int('100')).to.be.equals(false);
  });

  it('should is.bool handle true', () => {
    expect(is.bool(true)).to.be.equals(true);
  });
  it('should is.bool handle false', () => {
    expect(is.bool(false)).to.be.equals(true);
  });
  it('should is.bool handle int', () => {
    expect(is.bool('true')).to.be.equals(false);
  });

  it('should is.hex handle hex', () => {
    expect(is.hex('1234567890ABCD')).to.be.equals(true);
  });
  it('should is.hex handle value out of range', () => {
    expect(is.hex('1234567890ABCDE')).to.be.equals(false);
  });

  it('should is.hex handle not hex', () => {
    expect(is.hex('12648430T')).to.be.equals(false);
  });

  it('should is.obj handle obj', () => {
    expect(is.obj(generateNewMnemonic())).to.be.equals(true);
  });
  it('should is.obj handle primitive value', () => {
    expect(is.obj(false)).to.be.equals(false);
  });
  it('should is.obj handle array', () => {
    expect(is.obj(['false'])).to.be.equals(true);
  });

  it('should is.fn handle obj', () => {
    expect(is.fn(generateNewMnemonic)).to.be.equals(true);
  });
  it('should is.fn handle primitive value', () => {
    expect(is.fn(false)).to.be.equals(false);
  });
  it('should is.fn handle arrow function', () => {
    expect(is.fn(() => mnemonicToSeed)).to.be.equals(true);
  });

  it('should is.def handle any value', () => {
    expect(is.def(1)).to.be.equals(true);
  });
  it('should is.def handle undefined', () => {
    expect(is.def(undefined)).to.be.equals(false);
  });

  it('should is.undef handle undefined', () => {
    expect(is.undef(undefined)).to.be.equals(true);
  });
  it('should is.undef handle any value', () => {
    expect(is.undef('undefined')).to.be.equals(false);
  });

  it('should is.null handle null', () => {
    expect(is.null(null)).to.be.equals(true);
  });
  it('should is.null handle any value', () => {
    expect(is.null('null')).to.be.equals(false);
  });

  it('should is.promise handle promise', () => {
    const promise = new Promise((() => {
    }));
    expect(is.promise(promise)).to.be.equals(true);
  });
  it('should is.promise handle non promise', () => {
    expect(is.promise(() => mnemonicToSeed)).to.be.equals(false);
  });

  it('should is.JSON handle empty json', () => {
    expect(is.JSON()).to.be.equals(true);
  });
  it('should is.JSON handle array', () => {
    expect(is.JSON([1, 2])).to.be.equals(true);
  });
  it('should is.JSON handle str as json', () => {
    expect(is.JSON('str')).to.be.equals(true);
  });
  it('should is.JSON not allow circular references', () => {
    const circularReference = {};
    circularReference.myself = circularReference;
    expect(is.JSON(circularReference)).to.be.equals(false);
  });

  it('should is.stringified handle empty JSON', () => {
    expect(is.stringified('{}')).to.be.equals(true);
  });
  it('should is.stringified handle JSON', () => {
    expect(is.stringified('{"result":true, "count":42}')).to.be.equals(true);
  });
  it('should is.stringified handle str', () => {
    expect(is.stringified('true')).to.be.equals(true);
  });
  it('should is.stringified not allow circular references', () => {
    const circularReference = {};
    circularReference.myself = circularReference;
    expect(is.stringified(circularReference)).to.be.equals(false);
  });
});