const DAPIClient = require('@dashevo/dapi-client');
const Wallet = require('../src/Wallet');

const startG = async () => {
  const transport = new DAPIClient({ seeds: [{ ip: '54.191.116.37', port: 3000 }] });
  const g = await transport.getBestBlockHeight();
  console.log(g);
};
// startG();

const transport = new DAPIClient({ seeds: [{ ip: '54.191.116.37', port: 3000 }] });
transport.getTransaction = transport.getTransactionById;
transport.MNDiscovery.getMNList().then((mnList) => {
  const peersIP = mnList.map(el => ({ ip } = el.ip));
  console.log('List of known peer', peersIP);
});
const wallet = new Wallet({
  network: 'testnet',
  transport,
  privateKey: 'cR4t6evwVZoCp1JsLk4wURK4UmBCZzZotNzn9T1mhBT19SH9JtNt',
  // "mnemonic":"knife easily prosper input concert merge prepare autumn pen blood glance toilet"
  // mnemonic:'never citizen worry shrimp used wild color snack undo armed scout chief'
  // mnemonic: 'figure bridge cupboard reduce note fatal idea agent uphold media almost announce',
  // mnemonic: 'protect cave garden achieve hand vacant clarify atom finish outer waste sword',
  // "mnemonic": "increase table banana fiscal innocent wool sport mercy motion stable prize promote",
  // "mnemonic": "crack spice venue ticket vacant steak next stomach amateur review okay curtain",
  // "mnemonic": "sunny soccer know title act build split soccer leaf tomato symbol name",

});

console.log('Random generated mnemonic:', wallet.exportWallet());
const account = wallet.getAccount(0);

const start = async () => {
  const balance = account.getBalance();
  console.log('Balance', balance);

  const { address } = account.getUnusedAddress();
  console.log('New unused address', address);

  const payTo = 'yRdxQQpXYh9Xkd91peJ7FJxpEzoRb6droH';
  // const addressSum = await account.transport.getAddressSummary(address);
  // console.log(addressSum)

  console.log(account.storage.store.transactions)
  console.log(account.plugins)
  console.log(account.storage.store.wallets['bd0858f420'].addresses)
  const tx = await account.getTransactionHistory();
  console.log(tx)
};

account.events.on('ready', start);
