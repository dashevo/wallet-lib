const DAPIClient = require('@dashevo/dapi-client');
const { Wallet, plugins, utils } = require('../src');
const DashPayDAP = require('./daps/DashPayDAP');
const nodeforage = require('nodeforage');

const wallet = new Wallet({
  network: 'testnet',
  adapter: nodeforage.createInstance({ name: 'nodeforage-1' }),
  // mnemonic: 'swap slam aisle trend wing lawn profit ill town duty choice garage',
  mnemonic: 'smart rug aspect stuff auction bridge title virtual illegal enact black since', // Werner - dev (10 Nov)
  plugins: [DashPayDAP],
  // because of accessing to keyChain... We can later on make the same exception
  // than with already default plugins we are using
  forceUnsafePlugins: true,
});

const account = wallet.getAccount();


const start = async () => {

  const balance = account.getBalance();
  console.log('Balance', balance);

  const { address } = account.getUnusedAddress();
  console.log('New address', address);

  const dashpayDap = account.getDAP('DashPayDAP');

  const user = await dashpayDap.registerUsername('DashPayTeam');
  console.log('Created User', user);

  const search3 = await dashpayDap.searchUsername('DashPayTeam3');
  console.log(search3);
};
account.events.on('ready', start);
