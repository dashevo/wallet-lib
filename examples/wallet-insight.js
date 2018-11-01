const Wallet = require('../src/Wallet');

const wallet = new Wallet({
  mnemonic: 'wisdom claim quote stadium input danger planet angry crucial cargo struggle medal',
  network: 'testnet',
  transport: 'insight',
});

const account = wallet.getAccount();

account.events.on('prefetched', () => {
  console.log('prefetched');
});
account.events.on('discovery_started', () => {
  console.log('discovery_started');
});
account.events.on('ready', async () => {
  console.log('ready!');
  const tx = await account.getTransactionHistory();
  // console.log(tx);
  // console.log(account.storage.store.wallets['7793436096'].addresses.external)

  const balance = account.getBalance();
  console.log('Balance', balance);

  const { address } = account.getUnusedAddress(true);
  console.log('Send half balance a child addr:', address);

  const isIs = true;
  const amount = parseInt(balance / 2, 10);

  console.log('Will pay', amount, 'in is to', address);

  const rawTx = account.createTransaction({
    to: address,
    satoshis: amount,
    isInstantSend: isIs,
  });
  console.log('Created rawtx', rawTx);
  // const txid = await account.broadcastTransaction(rawTx, true);
  // console.log('Broadcasted:', txid);
});
