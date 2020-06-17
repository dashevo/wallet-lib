const {Wallet} = require('.');
const BIP44Worker = require('./src/plugins/Workers/BIP44Worker/BIP44Worker')

// const wallet = new Wallet({
  // mnemonic: null,
  // seeds: [{service: '34.212.176.135'}]
// });

// (async ()=>{
  // const account = await wallet.getAccount();
  // console.log(account.getTotalBalance());
  // console.log(account.transporter.)
  // const hasPlugin = account.hasPlugins([BIP44Worker])
  // console.log(hasPlugin);
  // account.getUTXOS()
// })();

const w = new Wallet({});
w.sweepWallet()
