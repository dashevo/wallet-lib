const { expect } = require('chai');

const {
  PrivateKey,
} = require('@dashevo/dashcore-lib');

const { Wallet, EVENTS } = require('../../src/index');

const isRegtest = process.env.NETWORK === 'regtest' || process.env.NETWORK === 'local';

/**
 *
 * @param {Account} walletAccount
 * @return {Promise<void>}
 */
function waitForBalanceToChange(walletAccount) {
  return new Promise((resolve => {
    walletAccount.on(EVENTS.FETCHED_CONFIRMED_TRANSACTION, () => {
      return resolve();
    });
  }));
}

/**
 *
 * @param {Wallet} faucetWallet
 * @param {Address} address
 * @param {number} amount
 * @return {Promise<string>}
 */
async function fundAddress(faucetWallet, address, amount) {
  const account = await faucetWallet.getAccount();

  const tx = await account.createTransaction({satoshis: amount, recipient: address });
  await account.broadcastTransaction(tx);

  if (isRegtest) {
    const privateKey = new PrivateKey();

    await faucetWallet.transport.client.core.generateToAddress(
        1,
        privateKey.toAddress(process.env.NETWORK).toString(),
    );
  }

  return tx.id;
}

const seeds = process.env.DAPI_SEED
  .split(',');

let newWallet;
let wallet;
let account;
let faucetPrivateKey;
let faucetWallet;

describe('Wallet-lib - functional ', function suite() {
  this.timeout(700000);

  before(() => {
    faucetPrivateKey = PrivateKey.fromString(process.env.FAUCET_PRIVATE_KEY);
    faucetWallet = new Wallet({
      transport: {
        seeds,
      },
      network: process.env.NETWORK,
      privateKey: faucetPrivateKey
    });
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
        newWallet = new Wallet({
          transport: {
            seeds,
          },
          network: process.env.NETWORK,
        });

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
          transport: {
            seeds,
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
      const faucetPrivateKey = PrivateKey.fromString(process.env.FAUCET_PRIVATE_KEY);
      const faucetAddress = faucetPrivateKey
        .toAddress(process.env.NETWORK)
        .toString();

      const balanceBeforeTopUp = account.getTotalBalance();
      const amountToTopUp = 20000;

      await fundAddress(
        faucetWallet,
        account.getAddress().address,
        amountToTopUp,
      );

      await waitForBalanceToChange(account);

      const balanceAfterTopUp = account.getTotalBalance();

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
      const newTx = account.createTransaction({ recipient: 'ydvgJ2eVSmdKt78ZSVBJ7zarVVtdHGj3yR', satoshis: Math.floor(account.getTotalBalance() / 2) });
      expect(newTx.constructor.name).to.equal('Transaction');
      expect(newTx.outputs.length).to.not.equal(0);
      expect(newTx.inputs.length).to.not.equal(0);
    });
  });
});
