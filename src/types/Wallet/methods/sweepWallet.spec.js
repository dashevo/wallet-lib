const {Wallet} = require('../../../index');
const expectThrowsAsync = require('../../../utils/expectThrowsAsync');
const sweepWallet = require('./sweepWallet');

const paperWallet = {
  publicKey: 'ybvbBPisVjiemj4qSg1mzZAzTSAPk64Ppf',
  privateKey: 'XE6ZTNwkjyuryGho75fAfCBBtL8rMy9ttLq1ANLF1TmMo2zwZXHq',
};

describe('Wallet - sweepWallet', function suite() {
  this.timeout(900000);
  let emptyWallet;
  let emptyAccount;
  const transportOpts = (process.env.DAPI_SEED)
      ? {
        seeds: process.env.DAPI_SEED
            .split(',')
      }
      : {}
  before(async () => {
    emptyWallet = new Wallet({
      privateKey: paperWallet.privateKey,
      transport: transportOpts
    });

    emptyAccount = await emptyWallet.getAccount();
    console.log(emptyAccount);
  });

  after(async () => {
    if (emptyWallet) {
      console.log('Disconnect');
      await emptyWallet.disconnect();
    }
  });

  it('should warn on empty balance', async () => {
    await emptyAccount.isReady();
    console.log('ISREADY');
    const exceptedException = 'Cannot sweep an empty private key (current balance: 0)';
    await expectThrowsAsync(async () => await emptyWallet.sweepWallet(), exceptedException);
    console.log('WARN DISCONNECT');
    await emptyWallet.disconnect();
  });
  it('should warn on sweep from mnemonic', async () => {
    const exceptedException = 'Can only sweep wallet initialized from privateKey';
    const mockWallet = {
      walletType: 'HDWALLET',
      getAccount: () => ({getAddress: () => ({address: null}), isReady: () => true}),
    };
    expectThrowsAsync(async () => await sweepWallet.call(mockWallet), exceptedException);
  });
});
