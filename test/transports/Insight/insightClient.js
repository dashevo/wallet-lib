const { expect } = require('chai');
const Dashcore = require('@dashevo/dashcore-lib');
const Wallet = require('../../../src/Wallet');
const { mnemonicString1 } = require('../../fixtures.json');
const InsightClient = require('../../../src/transports/Insight/insightClient');

let wallet = null;
let account = null;

describe('Transport : Insight Client', function suite() {
  this.timeout(60000);
  before((done) => {
    const config = {
      transport: new InsightClient(),
      mnemonic: mnemonicString1,
      network: Dashcore.Networks.testnet,
    };
    wallet = new Wallet(config);
    account = wallet.createAccount();
    account.events.on('prefetched', () => {
      done();
    });
  });
  it('should be able to pass Insight Client as a transport layer', () => {
    expect(wallet.transport).to.not.equal(null);
    expect(wallet.transport.type).to.equal('InsightClient');
    expect(account.transport).to.not.equal(null);
    expect(account.transport.type).to.equal('InsightClient');
  });
  it('should be able to get the address information', () => {
    const addressesExternalData = account.getAddresses();
    const path = 'm/44\'/1\'/0\'';
    expect(addressesExternalData).to.have.property(`${path}/0/0`);
    expect(addressesExternalData[`${path}/0/0`]).to.have.property('transactions');
    const expectedTransactionsArr = [
      'e66474bfe8ae3d91b2784864fc09e0bd615cbfbf4a2164e46b970bcc488a938f',
      'b4f567f398ec2174df2d775c9bcbc197efda2902bc4b628858d6c8ef7453284d',
    ];
    expect(addressesExternalData[`${path}/0/0`].transactions).to.deep.equal(expectedTransactionsArr);
    expect(addressesExternalData[`${path}/0/0`].utxos).to.deep.equal([]);
    expect(addressesExternalData[`${path}/0/0`].fetchedTimes).to.equal(1);
    expect(addressesExternalData[`${path}/0/0`].used).to.equal(true);
    expect(addressesExternalData[`${path}/0/0`].balance).to.equal(0);
  });
  it('should be able to get the utxos information', () => {
    const addressesExternalData = account.getAddresses();
    const path = 'm/44\'/1\'/0\'/0/1';
    expect(addressesExternalData).to.have.property(path);
    expect(addressesExternalData[path]).to.have.property('utxos');
    expect(addressesExternalData[path].utxos).to.have.length(1);
    expect(addressesExternalData[path].utxos[0].vout).to.equal(0);
    expect(addressesExternalData[path].utxos[0].address).to.equal('yf6qYQzQoCzpF7gJYAa7s3n5rBK89RoaCQ');
    expect(addressesExternalData[path].utxos[0].amount).to.equal(50);
    expect(addressesExternalData[path].utxos[0].satoshis).to.equal(5000000000);
    expect(addressesExternalData[path].utxos[0].height).to.equal(142810);
    expect(addressesExternalData[path].utxos[0].scriptPubKey).to.equal('76a914ce07ed014c455640a41e516ad4cc40fbc7fe435c88ac');
    expect(addressesExternalData[path].utxos[0].txid).to.equal('e66474bfe8ae3d91b2784864fc09e0bd615cbfbf4a2164e46b970bcc488a938f');
    expect(addressesExternalData[path].balance).to.equal(50);
  });
});
