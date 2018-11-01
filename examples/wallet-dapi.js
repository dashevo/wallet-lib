const DAPIClient = require('@dashevo/dapi-client');
const Wallet = require('../src/Wallet');
const transport = new DAPIClient({ seeds: [{ ip: '54.191.116.37', port: 3000 }] });

const startG = async () => {
  let g = await transport.getBestBlockHeight();
  console.log(g)
}
startG();



const start = async () => {
  const transport = new DAPIClient({ seeds: [{ ip: '54.255.164.83', port: 3000 }] });
  transport.getTransaction = transport.getTransactionById;

  const mnList = await transport.MNDiscovery.getMNList();
  const peersIP = mnList.map(el => ({ ip } = el.ip));

  console.log('List of known peer', peersIP);

  const wallet = new Wallet({
    network: 'testnet',
    transport,
    mnemonic: 'protect cave garden achieve hand vacant clarify atom finish outer waste sword',
  });

  console.log("Random generated mnemonic:",wallet.exportWallet());

  const account = wallet.getAccount(0);

  const balance = account.getBalance();
  console.log("Balance",balance);

  const { address } = account.getUnusedAddress();
  console.log("New unused address", address);
};
// start();
