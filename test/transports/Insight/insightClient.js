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
  it('should be able to get the total balance of an account', () => {
    const balance = account.getBalance();
    const expectedBalance = 99.9999;
    expect(balance).to.equal(expectedBalance);
  });
  it('should be able to get a valid UTXO', () => {
    const expectedUTXOS = [{
      address: 'yf6qYQzQoCzpF7gJYAa7s3n5rBK89RoaCQ',
      txid: 'e66474bfe8ae3d91b2784864fc09e0bd615cbfbf4a2164e46b970bcc488a938f',
      vout: 0,
      scriptPubKey: '76a914ce07ed014c455640a41e516ad4cc40fbc7fe435c88ac',
      amount: 50,
      satoshis: 5000000000,
      height: 142810,
    },
    {
      address: 'yeuLv2E9FGF4D9o8vphsaC2Vxoa8ZA7Efp',
      txid: 'e66474bfe8ae3d91b2784864fc09e0bd615cbfbf4a2164e46b970bcc488a938f',
      vout: 1,
      scriptPubKey: '76a914cbdb740680e713c141e9fb32e92c7d90a3f3297588ac',
      amount: 49.9999,
      satoshis: 4999990000,
      height: 142810,
    }];
    const UTXOS = account.getUTXOS();
    expect(UTXOS).to.deep.equal(expectedUTXOS);
  });

  it('should be able to create a transaction', () => {
    const { address } = account.getUnusedAddress();

    expect(address).to.equal('yRwh2qqnSgWKSaE7Vob35JY4wprvx8ujPZ');

    const txOpts = { amount: 15, to: address };
    const txOptsSatoshis = { satoshis: 1500000000, to: address };

    const expectedRawTx = '03000000018f938a48cc0b976be464214abfbf5c61bde009fc644878b2913daee8bf7464e6000000006b48304502210087d179bb9b26ab4966026a4542270d0627b90568ea21a60df5150834d663a0030220732d5f2b97a994f0e5dad4f0103b5a27927c229df317f98ca623ccbd3e0bc0000121029f883b2c3ec3a4804bcc1f66687a65ef265ce15b7f86c9a6e35ef86ca9ceced2ffffffff02002f6859000000001976a9143db3717b49fba213b0d0f988c3f6bca23e65815888acf6c29dd0000000001976a914d2ad4b21655c7e019077cdf759cd4c2a0b6682e988ac00000000';
    const rawTxFromAmount = account.createTransaction(txOpts);
    const rawTxFromSatoshisAmount = account.createTransaction(txOptsSatoshis);
    expect(rawTxFromAmount).to.equal(expectedRawTx);
    expect(rawTxFromSatoshisAmount).to.equal(expectedRawTx);
  });
  it('should bve able to create an instantSend transactions', () => {
    const { address } = account.getUnusedAddress();
    const txOptsInstant = {
      amount: 10,
      to: address,
      isInstantSend: true,
    };
    const expectedRawTx = '03000000018f938a48cc0b976be464214abfbf5c61bde009fc644878b2913daee8bf7464e6000000006a47304402203ac209efce9d8b231cc4e2ce557fc48a693cd22412a0aece05a19f183427e93102200d06ebb4e6520e8bd7167735527fa73e60933dfeab9ed1045e05c89dfaccc4720121029f883b2c3ec3a4804bcc1f66687a65ef265ce15b7f86c9a6e35ef86ca9ceced2ffffffff0200ca9a3b000000001976a9143db3717b49fba213b0d0f988c3f6bca23e65815888acf0006bee000000001976a914d2ad4b21655c7e019077cdf759cd4c2a0b6682e988ac00000000';
    const rawTx = account.createTransaction(txOptsInstant);
    expect(rawTx).to.equal(expectedRawTx);
  });
});
