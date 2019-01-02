const { Wallet, EVENTS } = require('../index');
const DAPIClient = require('@dashevo/dapi-client');
const ChainWorker = require('../src/plugins/Workers/ChainWorker');
const InMem = require('../src/adapters/InMem');

// console.log(AsyncStorage)
const wallet = new Wallet({
  mnemonic: 'smart rug aspect stuff auction bridge title virtual illegal enact black since', // Werner - dev (10 Nov)
  // privateKey: 'cR4t6evwVZoCp1JsLk4wURK4UmBCZzZotNzn9T1mhBT19SH9JtNt',
  network: 'testnet',
  adapter: InMem,
  injectDefaultPlugins: true,
  forceUnsafePlugins:true,
});

const account = wallet.getAccount();
// console.log(account)
const start = async () => {
  console.log('Balance Conf', await account.getBalance(false, false));
  console.log('Balance Unconf', await account.getBalance(true, false));
  console.log('New Addr', await account.getUnusedAddress().address);
  // const rawtx = account.createTransaction({amount:2, to: 'yWNrA4srrAjC9DT6UCu8NgpcqwQWa35dFX'});
  // console.log(rawtx);
  // let txid = await account.broadcastTransaction(rawtx);
  // console.log(txid);
  // const rawtx = account.createTransaction({
  //   to:'yZHMa5Xr6iEKtoei22wqtuaJGtxtSQZcAz',
  //   amount:1
  // })
  // console.log(await account.broadcastTransaction(rawtx))

};
account.events.on(EVENTS.GENERATED_ADDRESS, (info) => { console.log('GENERATED_ADDRESS'); });
account.events.on(EVENTS.BALANCE_CHANGED, (info) => { console.log('Balance Changed', info, info.delta); });
account.events.on(EVENTS.UNCONFIRMED_BALANCE_CHANGED, (info) => { console.log('UNCONFIRMED_BALANCE_CHANGED', info); });
account.events.on(EVENTS.READY, start);
account.events.on(EVENTS.BLOCKHEIGHT_CHANGED, info => console.log("BLOCKHEIGHT_CHANGED:",info));
account.events.on(EVENTS.PREFETCHED, () => { console.log(EVENTS.PREFETCHED); });
account.events.on(EVENTS.DISCOVERY_STARTED, () => console.log(EVENTS.PREFETCHED));