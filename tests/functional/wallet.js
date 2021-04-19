const {expect} = require('chai');

const {Wallet} = require('../../src/index');

const {fundWallet, waitForTransaction, waitForBlocks} = require('../../src/utils');
const {EVENTS} = require('../../src');
const DAPIClient = require('@dashevo/dapi-client');
let transportOptions = null;

if (process.env.DAPI_SEED) {
  transportOptions = {
    seeds: process.env.DAPI_SEED
        .split(',')
  }
}

const dapiClient = new DAPIClient({...transportOptions});

let newWallet;
let wallet;
let account;
let faucetWallet;
let faucetAccount;
let faucetAddress;
let newTx;
let skipSynchronizationBeforeHeight;

describe('Wallet-lib - functional ', function suite() {
  this.timeout(1100000);

  before(async () => {
    const status = await dapiClient.core.getStatus();
    const bestBlockHeight = status.blocks;
    skipSynchronizationBeforeHeight = (bestBlockHeight > 2000) ? bestBlockHeight - 2000 : 0;

    const faucetOpts = {
      transport: {...transportOptions},
      unsafeOptions: {
        skipSynchronizationBeforeHeight
      },
      network: process.env.NETWORK,
      privateKey: process.env.FAUCET_PRIVATE_KEY
    }
    if(faucetOpts.network === 'testnet'){
      // First faucet tx on testnet
      faucetOpts.unsafeOptions.skipSynchronizationBeforeHeight = 460950;
    }
    faucetWallet = new Wallet(faucetOpts);
  });

  after('Disconnection', () => {
    account.disconnect();
    wallet.disconnect();
    newWallet.disconnect();
    faucetWallet.disconnect();
  });

  describe('Wallet', () => {
    describe('Create a new Wallet', () => {
      it('should create a new wallet with default params', () => {
        const walletOpts = {
          transport: {...transportOptions},
          unsafeOptions: {
            skipSynchronizationBeforeHeight
          },
          network: process.env.NETWORK,
        }
        console.log('Using walletOpts: ', JSON.stringify(walletOpts));
        newWallet = new Wallet(walletOpts);

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
          mnemonic: newWallet.mnemonic,
          transport: {...transportOptions},
          unsafeOptions: {
            skipSynchronizationBeforeHeight
          },
          network: process.env.NETWORK,
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
        expect(exported).to.equal(newWallet.mnemonic);
      });
    });
  });

  describe('Account', () => {
    it('should await readiness', async () => {
      account = await wallet.getAccount();
      await account.isReady();
      expect(account.state.isReady).to.be.deep.equal(true);
    });
    it('populate balance with dash', async () => {
      const balanceBeforeTopUp = account.getTotalBalance();
      const amountToTopUp = 20000;

      await fundWallet(
          faucetWallet,
          wallet,
          amountToTopUp
      );
      // We know that faucetWallet has been synced after the fundWallet exec.
      // So we use that opportunity to set our local address as getAccount require syncing.
      faucetAccount = await faucetWallet.getAccount();
      faucetAddress = faucetAccount.getAddress(0).address;

      const balanceAfterTopUp = account.getTotalBalance();
      const transactions = account.getTransactions();

      expect(Object.keys(transactions).length).to.be.equal(1);
      expect(balanceBeforeTopUp).to.be.equal(0);
      expect(balanceAfterTopUp).to.be.equal(amountToTopUp);
    });

    it('should has unusedAddress with index 1', () => {
      const unusedAddress = account.getUnusedAddress();
      expect(unusedAddress.index).to.equal(1);
    });

    it('should not have empty balance', () => {
      expect(account.getTotalBalance()).to.not.equal(0);
    });

    it('should returns some available UTXO', () => {
      const UTXOs = account.getUTXOS();
      expect(UTXOs.length).to.not.equal(0);
    });

    it('should create a transaction', () => {
      // Send back to faucet address
      newTx = account.createTransaction({
        recipient: faucetAddress,
        satoshis: account.getTotalBalance()
      });

      console.log(`New transaction satoshis amount ${account.getTotalBalance()} to ${faucetAddress}`);
      expect(newTx.constructor.name).to.equal('Transaction');
      expect(newTx.outputs.length).to.not.equal(0);
      expect(newTx.inputs.length).to.not.equal(0);
    });
    it('should broadcast a transaction',  async() => {
      const txid = await account.broadcastTransaction(newTx);
      console.log(`Broadcast transaction: ${txid}`);

      // Waiting for two blocks as subscribe could emit a first block (the current one).
      await waitForBlocks(faucetAccount, 2);
      // FIXME: We can't use waitForTx as it is considered confirmed earlier than it is.
      // await waitForTransaction(faucetAccount, txid);

      expect(Object.keys(account.getTransactions()).length).to.be.equal(1);
    });

    it('should be able to restore wallet to the same state with a mnemonic', async () => {
      const restoredWallet = new Wallet({
        mnemonic: wallet.mnemonic,
        transport: {...transportOptions},
        unsafeOptions: {
          skipSynchronizationBeforeHeight
        },
        network: process.env.NETWORK,
      });
      const restoredAccount = await restoredWallet.getAccount();
      await waitForBlocks(restoredAccount, 2);

      const expectedAddresses = account.getAddresses();
      const expectedTransactions = account.getTransactions();

      const addresses = restoredAccount.getAddresses();
      const transactions = restoredAccount.getTransactions();

      expect(Object.keys(transactions).length).to.be.equal(1);
      expect(addresses).to.be.deep.equal(expectedAddresses);
      expect(Object.keys(transactions)).to.be.deep.equal(Object.keys(expectedTransactions));

      restoredWallet.disconnect();
    });
  });
});
