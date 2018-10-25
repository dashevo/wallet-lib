const DAPIClient = require('@dashevo/dapi-client');
const Wallet = require('../src/Wallet');

const start = async () => {
  const transport = new DAPIClient({ seeds: [{ ip: '18.237.151.230', port: 3000 }] });
  const mnList = await transport.MNDiscovery.getMNList();
  const peersIP = mnList.map(el => ({ ip } = el.ip));

  const wallet = new Wallet({
    network: 'testnet',
    transport,
    mnemonic: 'protect cave garden achieve hand vacant clarify atom finish outer waste sword',
  });
  console.log('New Clients :', peersIP);

  console.log(wallet.exportWallet());
  const account = wallet.getAccount(0);
  console.log(account);

  const balance = account.getBalance();
  console.log(balance);

  const address = account.getUnusedAddress();
  console.log(address);
};
start();
