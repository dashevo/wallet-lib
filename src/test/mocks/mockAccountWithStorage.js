const walletStoreMock = require('../../../fixtures/wallets/c922713eac.json');
const chainStoreMock = require('../../../fixtures/chains/for_wallet_c922713eac.json');
const Storage = require('../../types/Storage/Storage');

module.exports = (opts = {}) => {
  const { walletId } = walletStoreMock;

  const mockedAccount = {
    walletId,
    index: 0,
    storage: new Storage(),
    accountPath: "m/44'/1'/0'",
    network: 'testnet',
    ...opts,
  };

  mockedAccount.storage.createWalletStore(walletId);
  mockedAccount.storage.createChainStore('testnet');
  mockedAccount.storage.getWalletStore(walletId).importState(walletStoreMock);
  mockedAccount.storage.getChainStore('testnet').importState(chainStoreMock);

  return mockedAccount;
};
