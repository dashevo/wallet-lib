const { expect } = require('chai');
const Dashcore = require('@dashevo/dashcore-lib');
const Wallet = require('../../../src/Wallet');
const { mnemonicString1 } = require('../../fixtures.json');
const InsightClient = require('../../../src/transports/Insight/insightClient');

let wallet = null;
let account = null;
const insightClientOpts = {
  uri: 'https://testnet-insight.dashevo.org/insight-api-dash',
  socketUri: 'https://testnet-insight.dashevo.org/',
  useSocket: false,
};

describe('Transport : Insight Client', function suite() {
  this.timeout(60000);
  before((done) => {
    const config = {
      transport: new InsightClient(insightClientOpts),
      mnemonic: mnemonicString1,
      network: Dashcore.Networks.testnet,
    };
    wallet = new Wallet(config);
    account = wallet.createAccount();
    account.events.on('ready', () => {
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
    expect(addressesExternalData[`${path}/0/0`].fetchedLast).to.be.greaterThan(1533535093789);
    expect(addressesExternalData[`${path}/0/0`].used).to.equal(true);
    expect(addressesExternalData[`${path}/0/0`].balance).to.equal(0);
  });
  it('should be able to get the utxos information', () => {
    const addressesExternalData = account.getAddresses();
    const path = 'm/44\'/1\'/0\'/0/2';
    expect(addressesExternalData).to.have.property(path);
    expect(addressesExternalData[path]).to.have.property('utxos');
    expect(addressesExternalData[path].utxos).to.have.length(1);
    expect(addressesExternalData[path].utxos[0].vout).to.equal(0);
    expect(addressesExternalData[path].utxos[0].address).to.equal('yRwh2qqnSgWKSaE7Vob35JY4wprvx8ujPZ');
    expect(addressesExternalData[path].utxos[0].amount).to.equal(10);
    expect(addressesExternalData[path].utxos[0].satoshis).to.equal(1000000000);
    expect(addressesExternalData[path].utxos[0].height).to.equal(201516);
    expect(addressesExternalData[path].utxos[0].scriptPubKey).to.equal('76a9143db3717b49fba213b0d0f988c3f6bca23e65815888ac');
    expect(addressesExternalData[path].utxos[0].txid).to.equal('6770dee69437c6bf83a56956a04b807ef78cc62b79369b9551f935a922acbf64');
    expect(addressesExternalData[path].balance).to.equal(10);
  });
  it('should be able to get the total balance of an account', () => {
    const balance = account.getBalance();
    const expectedBalance = 99.99969999999999;
    expect(balance).to.equal(expectedBalance);
  });
  it('should be able to get a valid UTXO', () => {
    const expectedUTXOS = [
      {
        address: 'yfXQM8TaFiXFYtiFCSm3y6fRq15cj59vVK',
        amount: 39.9999,
        height: 201516,
        satoshis: 3999990000,
        scriptPubKey: '76a914d2ad4b21655c7e019077cdf759cd4c2a0b6682e988ac',
        txid: '6770dee69437c6bf83a56956a04b807ef78cc62b79369b9551f935a922acbf64',
        vout: 1,
      },
      {
        address: 'yMi854XzeEmAz9UczDCj9tvXeddweKc9JM',
        amount: 39.9998,
        height: 201517,
        satoshis: 3999980000,
        scriptPubKey: '76a9140f42047f86d356426458eba372031f524af548ce88ac',
        txid: '1954c3263831dd4d80a9dd8f83a6ce998dae0bed3c9ae111f7c84b0a4f65235f',
        vout: 1,
      },
      {
        address: 'yRwh2qqnSgWKSaE7Vob35JY4wprvx8ujPZ',
        amount: 10,
        height: 201516,
        satoshis: 1000000000,
        scriptPubKey: '76a9143db3717b49fba213b0d0f988c3f6bca23e65815888ac',
        txid: '6770dee69437c6bf83a56956a04b807ef78cc62b79369b9551f935a922acbf64',
        vout: 0,
      },
      {
        address: 'yPT2e1oAxN6GEa3tqahKg7KrXkwtKgpgPm',
        amount: 10,
        height: 201517,
        satoshis: 1000000000,
        scriptPubKey: '76a91422577ed4afdccae90307e874afe835f5158b068d88ac',
        txid: '1954c3263831dd4d80a9dd8f83a6ce998dae0bed3c9ae111f7c84b0a4f65235f',
        vout: 0,
      },

    ];
    const UTXOS = account.getUTXOS();
    expect(UTXOS).to.deep.equal(expectedUTXOS);
  });

  it('should be able to create a transaction', () => {
    const { address } = account.getUnusedAddress();

    expect(address).to.equal('yiFNYQxfkDxeCBLyWtWQ9w8UGwYugERLCq');

    const txOpts = { amount: 15, to: address };
    const txOptsSatoshis = { satoshis: 1500000000, to: address };

    const expectedRawTx = '030000000164bfac22a935f951959b36792bc68cf77e804ba05669a583bfc63794e6de7067010000006a47304402205d8926de3f37da11ce1d0acf01b3710ca283dfb05157b8bc0c0fa7699ef177ef02201fc2c99b5801ff851d34fe629785881b2379dcf55a1b3c749c6c74ea26e305080121025cf6335bc9a968ee0d113e7b9fb32064c35d816878873f100fe89570dc6fbf31ffffffff02002f6859000000001976a914f08d82224ffc020f3d7110e57c3105a5caec058f88ace0aa0295000000001976a91412e87d8a188ff29049b6a9e871018de65aa079c288ac00000000';
    const rawTxFromAmount = account.createTransaction(txOpts);
    const rawTxFromSatoshisAmount = account.createTransaction(txOptsSatoshis);
    expect(rawTxFromAmount).to.equal(expectedRawTx);
    expect(rawTxFromSatoshisAmount).to.equal(expectedRawTx);
  });
  it('should be able to create an instantSend transactions', () => {
    const { address } = account.getUnusedAddress();
    const txOptsInstant = {
      amount: 10,
      to: address,
      isInstantSend: true,
    };
    const expectedRawTx = '030000000164bfac22a935f951959b36792bc68cf77e804ba05669a583bfc63794e6de7067010000006a4730440220762e66e56ab4b462a9b1ef84ee859d806c2fab9a5f80b1726d7777b78c5d5097022077a3f6273239fd6d575bfbf97f9431a859e8c2641e6551f189a954bc23c316b00121025cf6335bc9a968ee0d113e7b9fb32064c35d816878873f100fe89570dc6fbf31ffffffff0200ca9a3b000000001976a914f08d82224ffc020f3d7110e57c3105a5caec058f88ace00fd0b2000000001976a91412e87d8a188ff29049b6a9e871018de65aa079c288ac00000000';
    const rawTx = account.createTransaction(txOptsInstant);
    expect(rawTx).to.equal(expectedRawTx);
  });
  it('should not be able to create an instantSend transactions without opts', () => {
    expect(() => account.createTransaction()).to.throw('An amount in dash or in satoshis is expected to create a transaction');
  });
  it('should not be able to create an instantSend transactions without amount', () => {
    const { address } = account.getUnusedAddress();
    const txOptsInstant = {
      to: address,
      isInstantSend: true,
    };
    expect(() => account.createTransaction(txOptsInstant)).to.throw('An amount in dash or in satoshis is expected to create a transaction');
  });
  it('should not be able to create an instantSend transactions without to', () => {
    const txOptsInstant = {
      amount: 10,
      isInstantSend: true,
    };
    expect(() => account.createTransaction(txOptsInstant)).to.throw('A recipient is expected to create a transaction');
  });
  it('should be able to create an instantSend transactions with satoshis', () => {
    const { address } = account.getUnusedAddress();
    const txOptsInstant = {
      satoshis: 11,
      to: address,
      isInstantSend: true,
    };
    const expectedRawTx = '030000000164bfac22a935f951959b36792bc68cf77e804ba05669a583bfc63794e6de7067010000006b48304502210097b4b84999c5288457bd325e781c6eed9871d3d133b6957f4136d61505dc5480022011d65cbb3dbc686ab698dbd0b00007ff1a86fa5e4152fe1a431d7a91494135f80121025cf6335bc9a968ee0d113e7b9fb32064c35d816878873f100fe89570dc6fbf31ffffffff020b000000000000001976a914f08d82224ffc020f3d7110e57c3105a5caec058f88acd5d96aee000000001976a91412e87d8a188ff29049b6a9e871018de65aa079c288ac00000000';
    const rawTx = account.createTransaction(txOptsInstant);
    expect(rawTx).to.equal(expectedRawTx);
  });

  it('should be able to create an instantSend transactions with satoshis and amount. Ammount is ignored?', () => {
    const { address } = account.getUnusedAddress();
    const txOptsInstant = {
      amount: 10,
      satoshis: 11,
      to: address,
      isInstantSend: true,
    };
    const expectedRawTx = '030000000164bfac22a935f951959b36792bc68cf77e804ba05669a583bfc63794e6de7067010000006b48304502210097b4b84999c5288457bd325e781c6eed9871d3d133b6957f4136d61505dc5480022011d65cbb3dbc686ab698dbd0b00007ff1a86fa5e4152fe1a431d7a91494135f80121025cf6335bc9a968ee0d113e7b9fb32064c35d816878873f100fe89570dc6fbf31ffffffff020b000000000000001976a914f08d82224ffc020f3d7110e57c3105a5caec058f88acd5d96aee000000001976a91412e87d8a188ff29049b6a9e871018de65aa079c288ac00000000';
    const rawTx = account.createTransaction(txOptsInstant);
    expect(rawTx).to.equal(expectedRawTx);
  });

  it('should be able to create a wallet without transport', () => {
    const wallet2 = new Wallet({
      mnemonic: 'wisdom claim quote stadium input danger planet angry crucial cargo struggle medal',
      network: 'testnet',
    });
    expect(wallet2.transport).to.be.equal(null);
    const acc1 = wallet2.createAccount({ mode: 'light' });
    const acc2 = wallet2.createAccount({ mode: 'light' });
    const acc3 = wallet2.createAccount({ mode: 'light' });


    [acc1, acc2, acc3].forEach((el, i) => {
      // eslint-disable-next-line no-unused-expressions
      expect(el).to.exist;
      expect(el).to.be.a('object');
      expect(el.constructor.name).to.equal('Account');
      expect(el.BIP44PATH).to.equal(`m/44'/1'/${i}'`);
    });
    wallet2.disconnect();
  });

  it('should be able to create a wallet and account with invalid transport', () => {
    const wallet3 = new Wallet({
      mnemonic: 'wisdom claim quote stadium input danger planet angry crucial cargo struggle medal',
      network: 'testnet',
      transport: 'haha',

    });
    expect(wallet3.transport).to.not.equal(null);
    expect(wallet3.transport.type).to.equal('String');

    const acc1 = wallet3.createAccount({ mode: 'light' });
    const acc2 = wallet3.createAccount({ mode: 'light' });
    const acc3 = wallet3.createAccount({ mode: 'light' });
    [acc1, acc2, acc3].forEach((el, i) => {
      // eslint-disable-next-line no-unused-expressions
      expect(el).to.exist;
      expect(el).to.be.a('object');
      expect(el.constructor.name).to.equal('Account');
      expect(el.BIP44PATH).to.equal(`m/44'/1'/${i}'`);
    });
    expect(acc1.transport).to.not.equal(null);
    expect(acc1.transport.type).to.equal('String');
    wallet3.disconnect();
  });

  it('should not be able to getAddressSummary by invalid vale ', () => {
    const transport = new InsightClient(insightClientOpts);
    return transport.getAddressSummary('address').then(
      () => Promise.reject(new Error('Expected method to reject.')),
      err => expect(err).to.be.a('Error').with.property('message', 'Request failed with status code 400'),
    );
  });

  it('should get a transactions History', () => {
    const expected = [{
      txid: 'e66474bfe8ae3d91b2784864fc09e0bd615cbfbf4a2164e46b970bcc488a938f',
      version: 1,
      locktime: 0,
      vin: [{
        txid: 'b4f567f398ec2174df2d775c9bcbc197efda2902bc4b628858d6c8ef7453284d', vout: 0, sequence: 4294967295, n: 0, scriptSig: { hex: '483045022100bb3c68629c143c6852967dae36744913b2aaa7ee3d09fc62c5902fe1439dcbec022033eb8522173c1d9e0ba8a0d096cda53cad4e9718a5e5848e400558517d00cfaf0121034af503d14b1207cafdc669987b43ef62a6ce52403b29a83b67826c563663a2f7', asm: '3045022100bb3c68629c143c6852967dae36744913b2aaa7ee3d09fc62c5902fe1439dcbec022033eb8522173c1d9e0ba8a0d096cda53cad4e9718a5e5848e400558517d00cfaf[ALL] 034af503d14b1207cafdc669987b43ef62a6ce52403b29a83b67826c563663a2f7' }, addr: 'yRdxQQpXYh9Xkd91peJ7FJxpEzoRb6droH', valueSat: 10000000000, value: 100, doubleSpentTxID: null,
      }],
      vout: [{
        value: '50.00000000',
        n: 0,
        scriptPubKey: {
          hex: '76a914ce07ed014c455640a41e516ad4cc40fbc7fe435c88ac', asm: 'OP_DUP OP_HASH160 ce07ed014c455640a41e516ad4cc40fbc7fe435c OP_EQUALVERIFY OP_CHECKSIG', addresses: ['yf6qYQzQoCzpF7gJYAa7s3n5rBK89RoaCQ'], type: 'pubkeyhash',
        },
        spentTxId: '6770dee69437c6bf83a56956a04b807ef78cc62b79369b9551f935a922acbf64',
        spentIndex: 0,
        spentHeight: 201516,
      }, {
        value: '49.99990000',
        n: 1,
        scriptPubKey: {
          hex: '76a914cbdb740680e713c141e9fb32e92c7d90a3f3297588ac', asm: 'OP_DUP OP_HASH160 cbdb740680e713c141e9fb32e92c7d90a3f32975 OP_EQUALVERIFY OP_CHECKSIG', addresses: ['yeuLv2E9FGF4D9o8vphsaC2Vxoa8ZA7Efp'], type: 'pubkeyhash',
        },
        spentTxId: '1954c3263831dd4d80a9dd8f83a6ce998dae0bed3c9ae111f7c84b0a4f65235f',
        spentIndex: 0,
        spentHeight: 201517,
      }],
      blockhash: '00000000050beeebb2a07be636dd0e066b11a20fbe13ffbb8c853232d58b96c0',
      blockheight: 142810,
      time: 1529233103,
      blocktime: 1529233103,
      valueOut: 99.9999,
      size: 226,
      valueIn: 100,
      fees: 0.0001,
      txlock: false,
    }, {
      txid: 'b4f567f398ec2174df2d775c9bcbc197efda2902bc4b628858d6c8ef7453284d',
      version: 1,
      locktime: 0,
      vin: [{
        txid: '253ef33bc86f73214a37c32ff36721480e7e5386dce0f3c184345f53ea5844c9', vout: 0, sequence: 4294967295, n: 0, scriptSig: { hex: '47304402206f514f909071f5cc77c2e4b1207d5da46e221bf38b797771fc92949c52b24fc50220359a5aca772a5ed19ed1bea9b584322221dfcdb1c9c4fedc4a08d5567b0d28df012103c9e5fb9318eb4517c9a2de863f19176fe1056d5c246bf8891336debd20e4bcf4', asm: '304402206f514f909071f5cc77c2e4b1207d5da46e221bf38b797771fc92949c52b24fc50220359a5aca772a5ed19ed1bea9b584322221dfcdb1c9c4fedc4a08d5567b0d28df[ALL] 03c9e5fb9318eb4517c9a2de863f19176fe1056d5c246bf8891336debd20e4bcf4' }, addr: 'yfPzgAZasiJGbiaYfJq7zXNN58PJAhbV1R', valueSat: 91846658523, value: 918.46658523, doubleSpentTxID: null,
      }],
      vout: [{
        value: '100.00000000',
        n: 0,
        scriptPubKey: {
          hex: '76a9143a58c9ab2acc51d5e810f55ad23717ae94fc965688ac', asm: 'OP_DUP OP_HASH160 3a58c9ab2acc51d5e810f55ad23717ae94fc9656 OP_EQUALVERIFY OP_CHECKSIG', addresses: ['yRdxQQpXYh9Xkd91peJ7FJxpEzoRb6droH'], type: 'pubkeyhash',
        },
        spentTxId: 'e66474bfe8ae3d91b2784864fc09e0bd615cbfbf4a2164e46b970bcc488a938f',
        spentIndex: 0,
        spentHeight: 142810,
      }, {
        value: '818.46639083',
        n: 1,
        scriptPubKey: {
          hex: '76a91487f94ff533ace02c608f9104f0a9d15bec797b4188ac', asm: 'OP_DUP OP_HASH160 87f94ff533ace02c608f9104f0a9d15bec797b41 OP_EQUALVERIFY OP_CHECKSIG', addresses: ['yYiQjdCR23ZpFCh9dkUCkjzqHGAqL1MJyE'], type: 'pubkeyhash',
        },
        spentTxId: 'e092395f069fbc62e4e88df6a962833a26ffb6f8f6fe984c70e23a47d406ac89',
        spentIndex: 0,
        spentHeight: 201382,
      }],
      blockhash: '0000000005908b72a6934d1be80a7138f951db0bc1262c6ba0ed51ecfd362f07',
      blockheight: 142615,
      time: 1529201724,
      blocktime: 1529201724,
      valueOut: 918.46639083,
      size: 225,
      valueIn: 918.46658523,
      fees: 0.0001944,
      txlock: false,
    }, {
      txid: '6770dee69437c6bf83a56956a04b807ef78cc62b79369b9551f935a922acbf64',
      version: 3,
      locktime: 0,
      vin: [{
        txid: 'e66474bfe8ae3d91b2784864fc09e0bd615cbfbf4a2164e46b970bcc488a938f', vout: 0, sequence: 4294967295, n: 0, scriptSig: { hex: '47304402203ac209efce9d8b231cc4e2ce557fc48a693cd22412a0aece05a19f183427e93102200d06ebb4e6520e8bd7167735527fa73e60933dfeab9ed1045e05c89dfaccc4720121029f883b2c3ec3a4804bcc1f66687a65ef265ce15b7f86c9a6e35ef86ca9ceced2', asm: '304402203ac209efce9d8b231cc4e2ce557fc48a693cd22412a0aece05a19f183427e93102200d06ebb4e6520e8bd7167735527fa73e60933dfeab9ed1045e05c89dfaccc472[ALL] 029f883b2c3ec3a4804bcc1f66687a65ef265ce15b7f86c9a6e35ef86ca9ceced2' }, addr: 'yf6qYQzQoCzpF7gJYAa7s3n5rBK89RoaCQ', valueSat: 5000000000, value: 50, doubleSpentTxID: null,
      }],
      vout: [{
        value: '10.00000000',
        n: 0,
        scriptPubKey: {
          hex: '76a9143db3717b49fba213b0d0f988c3f6bca23e65815888ac', asm: 'OP_DUP OP_HASH160 3db3717b49fba213b0d0f988c3f6bca23e658158 OP_EQUALVERIFY OP_CHECKSIG', addresses: ['yRwh2qqnSgWKSaE7Vob35JY4wprvx8ujPZ'], type: 'pubkeyhash',
        },
        spentTxId: null,
        spentIndex: null,
        spentHeight: null,
      }, {
        value: '39.99990000',
        n: 1,
        scriptPubKey: {
          hex: '76a914d2ad4b21655c7e019077cdf759cd4c2a0b6682e988ac', asm: 'OP_DUP OP_HASH160 d2ad4b21655c7e019077cdf759cd4c2a0b6682e9 OP_EQUALVERIFY OP_CHECKSIG', addresses: ['yfXQM8TaFiXFYtiFCSm3y6fRq15cj59vVK'], type: 'pubkeyhash',
        },
        spentTxId: null,
        spentIndex: null,
        spentHeight: null,
      }],
      blockhash: '00000000030c6efb91a8a2317111efa84e123ce72e944d58913aec8e32e5da5b',
      blockheight: 201516,
      time: 1533535851,
      blocktime: 1533535851,
      valueOut: 49.9999,
      size: 225,
      valueIn: 50,
      fees: 0.0001,
      txlock: false,
    }, {
      txid: '1954c3263831dd4d80a9dd8f83a6ce998dae0bed3c9ae111f7c84b0a4f65235f',
      version: 3,
      locktime: 0,
      vin: [{
        txid: 'e66474bfe8ae3d91b2784864fc09e0bd615cbfbf4a2164e46b970bcc488a938f', vout: 1, sequence: 4294967295, n: 0, scriptSig: { hex: '4730440220214bf38364d9d3f2df63d20a8cd6c82b9305c0515080872253c1a9fde140de3f02203d462caf975b169369cdca0b1979a6e776d77d56c9800b9354b81581fcb16477012102b49dd1beb4acbad033563c60879b082d9ab824d9878baa775920d474b9d89455', asm: '30440220214bf38364d9d3f2df63d20a8cd6c82b9305c0515080872253c1a9fde140de3f02203d462caf975b169369cdca0b1979a6e776d77d56c9800b9354b81581fcb16477[ALL] 02b49dd1beb4acbad033563c60879b082d9ab824d9878baa775920d474b9d89455' }, addr: 'yeuLv2E9FGF4D9o8vphsaC2Vxoa8ZA7Efp', valueSat: 4999990000, value: 49.9999, doubleSpentTxID: null,
      }],
      vout: [{
        value: '10.00000000',
        n: 0,
        scriptPubKey: {
          hex: '76a91422577ed4afdccae90307e874afe835f5158b068d88ac', asm: 'OP_DUP OP_HASH160 22577ed4afdccae90307e874afe835f5158b068d OP_EQUALVERIFY OP_CHECKSIG', addresses: ['yPT2e1oAxN6GEa3tqahKg7KrXkwtKgpgPm'], type: 'pubkeyhash',
        },
        spentTxId: null,
        spentIndex: null,
        spentHeight: null,
      }, {
        value: '39.99980000',
        n: 1,
        scriptPubKey: {
          hex: '76a9140f42047f86d356426458eba372031f524af548ce88ac', asm: 'OP_DUP OP_HASH160 0f42047f86d356426458eba372031f524af548ce OP_EQUALVERIFY OP_CHECKSIG', addresses: ['yMi854XzeEmAz9UczDCj9tvXeddweKc9JM'], type: 'pubkeyhash',
        },
        spentTxId: null,
        spentIndex: null,
        spentHeight: null,
      }],
      blockhash: '000000000669c888e04819b9c986966c73fe20f6681fc3160f597b21676f2b9c',
      blockheight: 201517,
      time: 1533535885,
      blocktime: 1533535885,
      valueOut: 49.9998,
      size: 225,
      valueIn: 49.9999,
      fees: 0.0001,
      txlock: false,
    }];
    return account.getTransactionHistory().then(result => expect(result).to.deep.equal(expected));
  });
  it('should get a transaction', () => {
    const expected = {};
    return account.getTransaction(1).then(
      data => expect(data).to.be.a('String'),
      err => expect(err).to.be.a('Error').with.property('message', 'Received an invalid txid to fetch'),
    );
    return account.getTransaction(1).then(result => expect(result).to.deep.equal(expected));
  });
  it('should be able to broadcast transaction', () => {
    const { address } = account.getUnusedAddress();
    const txOptsInstant = {
      amount: 10,
      to: address,
      isInstantSend: true,
    };
    const tx = account.createTransaction(txOptsInstant);
    expect(tx).to.equal('030000000164bfac22a935f951959b36792bc68cf77e804ba05669a583bfc63794e6de7067010000006a4730440220762e66e56ab4b462a9b1ef84ee859d806c2fab9a5f80b1726d7777b78c5d5097022077a3f6273239fd6d575bfbf97f9431a859e8c2641e6551f189a954bc23c316b00121025cf6335bc9a968ee0d113e7b9fb32064c35d816878873f100fe89570dc6fbf31ffffffff0200ca9a3b000000001976a914f08d82224ffc020f3d7110e57c3105a5caec058f88ace00fd0b2000000001976a91412e87d8a188ff29049b6a9e871018de65aa079c288ac00000000');
    const fakedTx = `${tx}00201010`;

    return account.broadcastTransaction(fakedTx).then(
      data => expect(data).to.be.a('String'),
      err => expect(err).to.be.a('Error').with.property('message', 'Error: Request failed with status code 400'),
    );
  });
  after((done) => {
    account.disconnect();
    account = null;
    wallet = null;
    done();
  });
});
