const { Wallet, EVENTS } = require('../index');

const wallet = new Wallet({
  // mnemonic: 'wisdom claim quote stadium input danger planet angry crucial cargo struggle medal',
  mnemonic: 'vicious small purity purpose maze scatter library second parent lake ask boil',
  network: 'testnet',
  transport: 'insight',
});

const account = wallet.getAccount();

const start = async () => {
  console.log('ready!');
  // const txHistory = await account.getTransactionHistory();
  // console.log('Transaction History', tx);

  console.log('WalletID', wallet.walletId);
  // console.log('Store', account.storage.getStore().wallets[wallet.walletId].addresses.external[`m/44'/1'/0'/0/19`]);
  // console.log('Store', Object.keys(account.storage.getStore().transactions));
  // console.log('Plugins', account.plugins.workers.syncworker);

  // console.log(account.storage.store.wallets['7793436096'].addresses.external)
  // console.log(wallet.exportWallet());
  const balance = account.getBalance();
  console.log('Balance', balance);

  const { address } = account.getUnusedAddress(true);
  console.log('Send half balance a child addr:', address);

  const isIs = true;
  // const amount = parseInt(balance / 2, 10);
  const amount = parseInt(balance , 10);

  console.log('Will pay', amount, 'in is to', address);

  const rawTx = account.createTransaction({
    to: address,
    satoshis: amount,
    isInstantSend: isIs,
  });
  console.log('Created rawtx', rawTx);
  // const txid = await account.broadcastTransaction(rawTx, true);
  // console.log('Broadcasted:', txid);
};
account.events.on(EVENTS.BALANCE_CHANGED, (info) => { console.log('Balance Changed',info, info.delta); });
account.events.on(EVENTS.STARTED, start);
account.events.on(EVENTS.READY, () => start());
// account.events.on(EVENTS.FETCHED_ADDRESS, info => console.log(EVENTS.FETCHED_ADDRESS, info));
// account.events.on(EVENTS.FETCHED_TRANSACTIONS, info => console.log(EVENTS.FETCHED_TRANSACTIONS, info));
account.events.on(EVENTS.PREFETCHED, () => { console.log(EVENTS.PREFETCHED); });
account.events.on(EVENTS.DISCOVERY_STARTED, () => console.log(EVENTS.PREFETCHED));
