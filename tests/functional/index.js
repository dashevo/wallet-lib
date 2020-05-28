const { expect } = require('chai');
const mnemonic = 'advance garment concert scatter west fringe hurdle estate bubble angry hungry dress';
const { Wallet } = require('../../src/index');

describe('SDK', function suite() {
  this.timeout(100000);

  let wallet;
  describe('Wallet', () => {
    describe('Create a new Wallet', () => {
      it('should create a new wallet with default params', () => {
        const newWallet = new Wallet();

        expect(newWallet.walletType).to.be.equal('hdwallet');
        expect(newWallet.plugins).to.be.deep.equal({});
        expect(newWallet.accounts).to.be.deep.equal([]);
        expect(newWallet.keyChain.type).to.be.deep.equal('HDPrivateKey');
        expect(newWallet.passphrase).to.be.deep.equal(null);
        expect(newWallet.allowSensitiveOperations).to.be.deep.equal(false);
        expect(newWallet.injectDefaultPlugins).to.be.deep.equal(true);
        expect(newWallet.walletId).to.length(10);
        expect(newWallet.network).to.be.deep.equal('testnet');

        const exported = newWallet.exportWallet();
        expect(exported.split(' ').length).to.equal(12);
      });
    });
    describe('Load a wallet', () => {
      it('should load a wallet from mnemonic', () => {
        wallet = new Wallet({
          mnemonic,
        });

        expect(wallet.walletType).to.be.equal('hdwallet');
        expect(wallet.plugins).to.be.deep.equal({});
        expect(wallet.accounts).to.be.deep.equal([]);
        expect(wallet.keyChain.type).to.be.deep.equal('HDPrivateKey');
        expect(wallet.passphrase).to.be.deep.equal(null);
        expect(wallet.allowSensitiveOperations).to.be.deep.equal(false);
        expect(wallet.injectDefaultPlugins).to.be.deep.equal(true);
        expect(wallet.walletId).to.length(10);
        expect(wallet.network).to.be.deep.equal('testnet');

        const exported = wallet.exportWallet();
        expect(exported).to.equal(mnemonic);
      });
    });
  });
  let account;
  describe('Account', () => {
    it('should await readiness', async () => {
      account = wallet.getAccount();
      expect(account.state.isReady).to.be.deep.equal(false);

      await account.isReady();
      expect(account.state.isReady).to.be.deep.equal(true);
    });
    it('should get the expected unusedAddress', () => {
      const unusedAddress = account.getUnusedAddress();
      if (unusedAddress.index === 0) {
        throw new Error('Fund this address on testnet: yb9SZAkDS4p9UDRy3X5LAMrr3kLBaVgZDD');
      }
      expect(unusedAddress.address).to.equal('ydvgJ2eVSmdKt78ZSVBJ7zarVVtdHGj3yR');
    });
    it('should not have empty balance', () => {
      expect(account.getTotalBalance()).to.not.equal(0);
      console.log(account.getTotalBalance());
    });
    it('should returns some available UTXO', () => {
      const UTXOs = account.getUTXOS();
      expect(UTXOs.length).to.not.equal(0);
    });
  });
});
