const { Wallet } = require('../index');
const SyncWorker = require('../src/plugins/Workers/SyncWorker');
const ColdStorageWorker = require('./workers/ColdStorageWorker');
const WalletConsidator = require('./stdPlugins/WalletConsolidator');
const DAPDoc = require('./daps/DAPDoc');


const demoDAP = () => {
  const wallet = new Wallet({
    transport: 'insight',
    mnemonic: 'figure bridge cupboard reduce note fatal idea agent uphold media almost announce',
    injectDefaultPlugins: false,
    plugins: [DAPDoc],
  });


  const account = wallet.getAccount();
  // account.getUnusedAddress();
  account.events.on('ready', async () => {
    console.log('State of plugins', account.plugins);


    const dapDoc = account.getDAP('DAPDoc');
    const documentPath = `${__dirname}/document.txt`;
    const notarize = await dapDoc.notarizeDocument(documentPath);

    console.log('Notarized ?', notarize);
    // const DAPDOC = account.getPlugin('DAPDoc');
    // console.log(DAPDOC.notarizeDocument());
  });
};
const demoPlugin = () => {
  const wallet = new Wallet({
    transport: 'insight',
    mnemonic: 'figure bridge cupboard reduce note fatal idea agent uphold media almost announce',
    injectDefaultPlugins: false,
    plugins: [WalletConsidator],
  });


  const account = wallet.getAccount();
  // account.getUnusedAddress();
  account.events.on('ready', async () => {
    console.log('State of plugins', account.plugins);
    const conso = account.getPlugin('walletConsolidator');
    console.log(conso.consolidateWallet);
  });
};
const demoWorker = () => {
  const coldStorageAddress = 'yb67GKjkk4AMrJcqoedCjeemFGo9bDovNS';
  const coldStorageWorker = new ColdStorageWorker({ address: coldStorageAddress });
  const wallet = new Wallet({
    transport: 'insight',
    mnemonic: 'figure bridge cupboard reduce note fatal idea agent uphold media almost announce',
    injectDefaultPlugins: false,
    // plugins: [coldStorageWorker],
    plugins: [WalletConsidator, coldStorageWorker],
  });


  const account = wallet.getAccount();
  // account.getUnusedAddress();
  account.events.on('ready', async () => {
    console.log('State of plugins', account.plugins);
    console.log('Balance of account', account.getBalance());
    console.log('txHistory of account', await account.getTransactionHistory());
  });
};
const currentWorkerToPluginSystem = () => {
  const wallet = new Wallet({
    transport: 'insight',
    mnemonic: 'figure bridge cupboard reduce note fatal idea agent uphold media almost announce',
    injectDefaultPlugins: false,
    plugins: [SyncWorker, BI],
    forceUnsafePlugins: true,
  });
  const account = wallet.getAccount();
  account.getUnusedAddress();
  account.events.on('ready', async () => {
    console.log('State of plugins', account.plugins);
    console.log('Balance of account', account.getBalance());
    console.log('txHistory of account', await account.getTransactionHistory());
  });
};

// currentWorkerToPluginSystem();
// demoDAP()
// demoPlugin();
// demoWorker();
