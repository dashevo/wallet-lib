const { Wallet } = require('../index');
const util = require('util')
const config = {
  mnemonic: 'knife easily prosper input concert merge prepare autumn pen blood glance toilet',
  transport: 'insight',
  network: 'testnet',
};
const wallet = new Wallet(config);
const account = wallet.getAccount();

const start = async () => {
  // console.log(await account.getTransaction('4ae8d1960c9a4ed83dbeaf1ad94b4a82f11c8574207144beda87113d94a31da1'))
  // console.log(await account.getBalance())
  // console.log(await account.getBalance(false))
  const history = await account.getTransactionHistory();
  console.log("\n\n\n\n");
  console.log("====+HISTORY+=====");
  console.log(util.inspect(history, false, null, true /* enable colors */))

  // console.log(history);
};
account.events.on('ready', start);
