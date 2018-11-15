const { Wallet, EVENTS } = require('../index');
const dashcore = require('@dashevo/dashcore-lib');


const wallet = new Wallet({
   //mnemonic: 'wisdom claim quote stadium input danger planet angry crucial cargo struggle medal',
  //mnemonic: 'vicious small purity purpose maze scatter library second parent lake ask boil',
  // mnemonic: 'stumble airport enact ladder replace desert wire volcano custom warrior shrug save', // Dashpay Wallet common
  // mnemonic: 'figure bridge cupboard reduce note fatal idea agent uphold media almost announce',//500 dash
  mnemonic: "degree resemble there spoon tape stage chat entry tortoise narrow list awake",//Generated 7-Nov-2018
  network: 'testnet',
  transport: 'insight',
});

const account = wallet.getAccount();

// console.log(JSON.stringify(account.storage.getStore().wallets[wallet.walletId].addresses))
// throw new Error();
const start = async () => {
  console.log('ready!');
  const exported = wallet.exportWallet();
  // console.log(exported);
  // console.log(account.getUnusedAddress());
  const txHistory = await account.getTransactionHistory();
  // console.log('Transaction History', txHistory);

  // console.log('WalletID', wallet.walletId);
  // console.log('TX 1', JSON.stringify(account.storage.getTransaction('56150e17895255d178eb4d3da0ccd580fdf50233a3767e1f562e05f00b48cf79')));
  // console.log('TX 1', JSON.stringify(account.storage.getTransaction('3428f0c29370d1293b4706ffd0f8b0c84a5b7c1c217d319e5ef4722354000c6e')));
  console.log('Store', account.storage.getStore().wallets[wallet.walletId].addresses.external[`m/44'/1'/0'/0/0`]);
  // console.log('Store', account.storage.getStore().wallets[wallet.walletId].addresses.external[`m/44'/1'/0'/0/1`]);
  // console.log('Store', account.storage.getStore().wallets[wallet.walletId].addresses.external[`m/44'/1'/0'/0/2`]);
  // console.log('Store', account.storage.getStore().wallets[wallet.walletId].addresses.external[`m/44'/1'/0'/0/3`]);
  // console.log('Store', Object.keys(account.storage.getStore().transactions));
  // console.log('Plugins', account.plugins.workers.syncworker);

  // console.log(account.storage.store.wallets['7793436096'].addresses.external)
  // console.log(wallet.exportWallet());
  const balance = account.getBalance(true, true);
  console.log('Balance unconfirmed' , balance);

  const balanceconf = account.getBalance(false, false);
  console.log('Balance conf' , balanceconf);

  const { address } = account.getUnusedAddress(true);
  console.log('Send half balance a child addr:', address);

  const isIs = true;
  const amount = parseInt(balance/ 2, 10);
  // const amount = parseInt(balance , 10);

  console.log('Will pay', amount, 'in is to', address);

  const rawTx = account.createTransaction({
    to: address,
    satoshis: amount,
    isInstantSend: isIs,
  });
  console.log('Created rawtx', rawTx);

  // const tx = new dashcore.Transaction(rawTx);
  // console.log(tx.toObject(), tx._estimateSize());

  // const txid = await account.broadcastTransaction(rawTx, isIs);
  // console.log('Broadcasted:', txid);
};
account.events.on(EVENTS.BALANCE_CHANGED, (info) => { console.log('Balance Changed',info, info.delta); });
account.events.on(EVENTS.STARTED, start);
account.events.on(EVENTS.READY, () => start());
// account.events.on(EVENTS.FETCHED_ADDRESS, info => console.log(EVENTS.FETCHED_ADDRESS, info));
// account.events.on(EVENTS.FETCHED_TRANSACTIONS, info => console.log(EVENTS.FETCHED_TRANSACTIONS, info));
account.events.on(EVENTS.PREFETCHED, () => { console.log(EVENTS.PREFETCHED); });
account.events.on(EVENTS.DISCOVERY_STARTED, () => console.log(EVENTS.PREFETCHED));

