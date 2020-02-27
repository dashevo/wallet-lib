const { expect } = require('chai');
const { Wallet } = require('../../../../src/index');
const { expectThrowsAsync } = require('../../../test.utils');
const sweepWallet = require('../../../../src/types/Wallet/methods/sweepWallet');

const paperWallet = {
  publicKey: 'XrHzASeS4C4aRz9HsphNxXkeB9g2BHV1UL',
  privateKey: 'XE6ZTNwkjyuryGho75fAfCBBtL8rMy9ttLq1ANLF1TmMo2zwZXHq',
};
const testnetPaperWallet = {
  publicKey: 'yiqbNC2EEpNgAUC3XrJDccEZxzGsf2rc9w',
  privateKey: 'cUWeuzNzpVfKTQ28NEGaZWB3Sck3pDRNd6mSS1zqnMuPXBDefgkS',
};

describe('Wallet - sweepWallet', () => {
  let emptyAccount;
  let fullAccount;
  let emptyWallet;
  let fullWallet;
  before(() => {
    emptyWallet = new Wallet({ privateKey: paperWallet.privateKey, network: 'livenet' });
    emptyAccount = emptyWallet.getAccount();

    fullWallet = new Wallet({ privateKey: testnetPaperWallet.privateKey, network: 'testnet' });
    fullAccount = fullWallet.getAccount();
  });
  it('should pass sanitary check', () => {
    const addr = emptyAccount.getAddress();
    expect(addr).to.deep.equal({
      path: '0',
      index: 0,
      address: paperWallet.publicKey,
      transactions: [],
      balanceSat: 0,
      unconfirmedBalanceSat: 0,
      utxos: {},
      fetchedLast: 0,
      used: true,
    });
    const addrTestnet = fullAccount.getAddress();
    expect(addrTestnet.path).to.equal('0');
    expect(addrTestnet.index).to.equal(0);
    expect(addrTestnet.address).to.equal(testnetPaperWallet.publicKey);
    expect(addrTestnet.used).to.equal(true);
  });
  it('should warn on empty balance', () => {
    const exceptedException = 'Cannot sweep an empty private key (current balance: 0)';
    expectThrowsAsync(async () => await emptyWallet.sweepWallet(), exceptedException);
  });
  it('should warn on sweep from mnemonic', async () => {
    const exceptedException = 'Can only sweep wallet initialized from privateKey';
    expectThrowsAsync(async () => await sweepWallet.call({ walletType: 'HDWALLET' }), exceptedException);
  });
  it('should work', async () => {
    const wallet = await fullWallet.sweepWallet();
    console.log(wallet.export());
    console.log(mnemonic);
  });
  after(() => {
    emptyWallet.disconnect();
    fullWallet.disconnect();
  });
});
