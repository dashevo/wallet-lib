const { expect } = require('chai');
const Dashcore = require('@dashevo/dashcore-lib');
const _ = require('lodash');
const createTransaction = require('../../src/Account/createTransaction');
const getUnusedAddress = require('../../src/Account/getUnusedAddress');
const getAddress = require('../../src/Account/getAddress');
const generateAddress = require('../../src/Account/generateAddress');
const getPrivateKeys = require('../../src/Account/getPrivateKeys');
const searchTransaction = require('../../src/Storage/searchTransaction');
const getStore = require('../../src/Storage/getStore');
const getUTXOS = require('../../src/Account/getUTXOS');
const KeyChain = require('../../src/KeyChain');
const Storage = require('../../src/Storage/Storage');

const { mnemonicToHDPrivateKey } = require('../../src/utils');

const addressesFixtures = require('../fixtures/addresses.json');
const validStore = require('../fixtures/walletStore').valid.orange.store;
const duringDevelopStore = require('../fixtures/duringdevelop-fullstore-snapshot-1548538361');

const duringDevelopMnemonic = 'during develop before curtain hazard rare job language become verb message travel';

describe('Account - createTransaction', () => {
  it('sould warn on missing inputs', () => {
    const self = {
      store: validStore,
      walletId: 'a3771aaf93',
      getUTXOS,
    };

    const mockOpts1 = {};
    const mockOpts2 = {
      satoshis: 1000,
    };
    const mockOpts3 = {
      satoshis: 1000,
      recipient: addressesFixtures.testnet.valid.yereyozxENB9jbhqpbg1coE5c39ExqLSaG.addr,
    };
    const expectedException1 = 'An amount in dash or in satoshis is expected to create a transaction';
    const expectedException2 = 'A recipient is expected to create a transaction';
    const expectedException3 = 'Error: utxosList must contain at least 1 utxo';
    expect(() => createTransaction.call(self, mockOpts1)).to.throw(expectedException1);
    expect(() => createTransaction.call(self, mockOpts2)).to.throw(expectedException2);
    expect(() => createTransaction.call(self, mockOpts3)).to.throw(expectedException3);
  });
  it('should create valid transaction', () => {
    const walletId = '5061b8276c';
    const storage = new Storage();
    storage.importAddresses(duringDevelopStore.wallets[walletId].addresses.external, walletId);
    storage.importAddresses(duringDevelopStore.wallets[walletId].addresses.internal, walletId);
    storage.importAccounts(duringDevelopStore.wallets[walletId].accounts, walletId);
    storage.importTransactions(duringDevelopStore.transactions);
    const self = {
      store: duringDevelopStore,
      walletId,
      getUTXOS,
      getUnusedAddress,
      getAddress,
      accountIndex: 0,
      BIP44PATH: 'm/44\'/1\'/0\'',
      getPrivateKeys,
      generateAddress,
      keyChain: new KeyChain({ HDRootKey: mnemonicToHDPrivateKey(duringDevelopMnemonic, 'testnet', '') }),
      storage,
      events: { emit: _.noop },
    };

    const txOpts1 = {
      recipient: addressesFixtures.testnet.valid.yereyozxENB9jbhqpbg1coE5c39ExqLSaG.addr,
      satoshis: 1e8,
    };
    const tx1 = createTransaction.call(self, txOpts1);
    expect(tx1.constructor.name).to.equal('Transaction');
    expect(tx1.isFullySigned()).to.equal(true);
    expect(tx1.verify()).to.equal(true);
    const expectedRawTx1 = '0300000001bf4a70ad9d24deb6f374e088208af950c7a2e68d03cfa0a0f3e8e6553d3744dd010000006b483045022100f0971295bd5f0b82369a8dcdf34515f8167db2094730305ea553dd2136a6524e02201214ca804104855be1bcb63d018c3bd256d2a48cceb068c593cd0f1ae634858a012103fffaacbf96c63a6758b45a5c3ca0d1984781ed6991050169cd578b607d546b4dffffffff0200e1f505000000001976a914cb594917ad4e5849688ec63f29a0f7f3badb5da688ac12bb3320080000001976a9149c2e6d97ccb044a3e3ef44319dc1c53cf451988988ac00000000';
    expect(tx1.toString()).to.equal(expectedRawTx1);

    // Only satoshis was changed to equal amount. Should then be similar than first rawtx.
    const txOpts2 = {
      recipient: addressesFixtures.testnet.valid.yereyozxENB9jbhqpbg1coE5c39ExqLSaG.addr,
      amount: 1,
    };
    const tx2 = createTransaction.call(self, txOpts2);
    expect(tx2.toString()).to.equal(expectedRawTx1);

    const tx2Json = tx2.toJSON();
    expect(tx2Json.outputs.length).to.equal(2);
    expect(tx2Json.outputs[0].satoshis).to.equal(1e8);
    expect(tx2Json.outputs[1].satoshis).to.equal(34899999506);
    expect(tx2Json.fee).to.equal(247);

    expect(tx2.outputs[0].script.toAddress().toString()).to.equal('yereyozxENB9jbhqpbg1coE5c39ExqLSaG');
    expect(tx2.outputs[1].script.toAddress().toString()).to.equal('yaZFt1VnAbi72mtyjDNV4AwTECqdg5Bv95');

    expect(tx2.inputs[0].script.toAddress().toString()).to.equal('XeHNNXZJbUfJkyJbUDq4sp61dr6dHuCZec');
    expect(tx2.inputs[0].output._satoshis).to.equal(34999999753);


    // Validate other expected elements
  });
  it('should be able to have a passed change address', () => {

  });
});
