const DAPIClient = require('@dashevo/dapi-client');
const { Wallet, plugins, utils } = require('../src');
const DashPayDAP = require('./daps/DashPayDAP');

const transport = new DAPIClient({ seeds: [{ ip: '54.191.116.37', port: 3000 }] });
transport.getTransaction = transport.getTransactionById;
transport.MNDiscovery.getMNList().then((mnList) => {
  const peersIP = mnList.map(el => ({ ip } = el.ip));
  console.log('List of known peer', peersIP);
});

const wallet = new Wallet({
  network: 'testnet',
  transport,
  mnemonic: 'swap slam aisle trend wing lawn profit ill town duty choice garage',
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
  console.log(user);
};
account.events.on('ready', start);
