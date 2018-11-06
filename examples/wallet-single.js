const Wallet = require('../src/Wallet');

// const transport = 'insight';
const transport = 'notSomething';
const privateKey = 'cN1QZtX4wvx7MUmFt5hY3Nkrveeu7FipRciAcffsYBFmmwkBdzXa';
const network = 'testnet';
const transactions = "{\"c11891cb7b264351f442bd2f12de7c4a318018169912960437b97b538727f64f\":{\"txid\":\"c11891cb7b264351f442bd2f12de7c4a318018169912960437b97b538727f64f\",\"blockhash\":\"00000000415e17750ed32bbcd161e0067a37e4598d31a57edcb31edaa999d4d2\",\"blockheight\":243824,\"blocktime\":1539419766,\"fees\":10000,\"size\":226,\"vout\":[{\"value\":\"30.00000000\",\"n\":0,\"scriptPubKey\":{\"hex\":\"76a91462d1715c817093dece27d881af2fbe8391bf18b388ac\",\"asm\":\"OP_DUP OP_HASH160 62d1715c817093dece27d881af2fbe8391bf18b3 OP_EQUALVERIFY OP_CHECKSIG\",\"addresses\":[\"yVKwyLwGoCTebK5JGKFT7PhXUj2pr97G5V\"],\"type\":\"pubkeyhash\"},\"spentTxId\":null,\"spentIndex\":null,\"spentHeight\":null},{\"value\":\"3.04470000\",\"n\":1,\"scriptPubKey\":{\"hex\":\"76a91462d1715c817093dece27d881af2fbe8391bf18b388ac\",\"asm\":\"OP_DUP OP_HASH160 62d1715c817093dece27d881af2fbe8391bf18b3 OP_EQUALVERIFY OP_CHECKSIG\",\"addresses\":[\"yVKwyLwGoCTebK5JGKFT7PhXUj2pr97G5V\"],\"type\":\"pubkeyhash\"},\"spentTxId\":null,\"spentIndex\":null,\"spentHeight\":null}],\"vin\":[{\"txid\":\"3d0691c06393f90a27fe01f3248355a8d61f0ff2d171f9d3864e977a1b1c08f9\",\"vout\":0,\"sequence\":4294967295,\"n\":0,\"scriptSig\":{\"hex\":\"4830450221008f041130264bd14ada23af55b1a2a6efdaa383fa27fc7326e8b04534ed6da20c022021ae89f1b50e4f9bc48a10a53f01dcd9cfdbf6ab38dadc7a36e7815912093873012102a4262dfd02c3121e25f23573b19749398ae378264b5763e9add6d48183febb7c\",\"asm\":\"30450221008f041130264bd14ada23af55b1a2a6efdaa383fa27fc7326e8b04534ed6da20c022021ae89f1b50e4f9bc48a10a53f01dcd9cfdbf6ab38dadc7a36e7815912093873[ALL] 02a4262dfd02c3121e25f23573b19749398ae378264b5763e9add6d48183febb7c\"},\"addr\":\"yVKwyLwGoCTebK5JGKFT7PhXUj2pr97G5V\",\"valueSat\":3304480000,\"value\":33.0448,\"doubleSpentTxID\":null}],\"txlock\":false},\"3d0691c06393f90a27fe01f3248355a8d61f0ff2d171f9d3864e977a1b1c08f9\":{\"txid\":\"3d0691c06393f90a27fe01f3248355a8d61f0ff2d171f9d3864e977a1b1c08f9\",\"blockhash\":\"000000000107d55d789276e7ffc5dec829f7973185ca438b5e91d75b5bce94ec\",\"blockheight\":243798,\"blocktime\":1539416171,\"fees\":60596,\"size\":225,\"vout\":[{\"value\":\"33.04480000\",\"n\":0,\"scriptPubKey\":{\"hex\":\"76a91462d1715c817093dece27d881af2fbe8391bf18b388ac\",\"asm\":\"OP_DUP OP_HASH160 62d1715c817093dece27d881af2fbe8391bf18b3 OP_EQUALVERIFY OP_CHECKSIG\",\"addresses\":[\"yVKwyLwGoCTebK5JGKFT7PhXUj2pr97G5V\"],\"type\":\"pubkeyhash\"},\"spentTxId\":\"c11891cb7b264351f442bd2f12de7c4a318018169912960437b97b538727f64f\",\"spentIndex\":0,\"spentHeight\":243824},{\"value\":\"520.26959344\",\"n\":1,\"scriptPubKey\":{\"hex\":\"76a914fb9a442a7eb573a794f5da9d5e3cc720ef9e590a88ac\",\"asm\":\"OP_DUP OP_HASH160 fb9a442a7eb573a794f5da9d5e3cc720ef9e590a OP_EQUALVERIFY OP_CHECKSIG\",\"addresses\":[\"yjFoFxhKgjuT5QLsxYG8adjsSunXfXk3sJ\"],\"type\":\"pubkeyhash\"},\"spentTxId\":\"545d61092df7c9289bb458bd3c344942db4ef39be8fcfa9c871466f1531bc9c7\",\"spentIndex\":0,\"spentHeight\":243806}],\"vin\":[{\"txid\":\"219481e8a61179cde50c98aa0cec7421af78591073249d9d9f2c101a5508b783\",\"vout\":1,\"sequence\":4294967294,\"n\":0,\"scriptSig\":{\"hex\":\"4730440220516a47352d6c5d57766978ee32243e2bb613ed19c9e9818c8637b68c1c4e4205022008d19bd2a6ee624a474d780da3885ffa2c4913e493cf9243565d090dae8c735f012103e82fe1040ec1d733535066d7092dfc72fb14989fc29bea6f6e92284053d61acd\",\"asm\":\"30440220516a47352d6c5d57766978ee32243e2bb613ed19c9e9818c8637b68c1c4e4205022008d19bd2a6ee624a474d780da3885ffa2c4913e493cf9243565d090dae8c735f[ALL] 03e82fe1040ec1d733535066d7092dfc72fb14989fc29bea6f6e92284053d61acd\"},\"addr\":\"yXi4242Ny7RuqoCHMzpoU14ruEvbNyA8QS\",\"valueSat\":55331499940,\"value\":553.3149994,\"doubleSpentTxID\":null}],\"txlock\":false}}\n"
const addresses = '{"address":"yVKwyLwGoCTebK5JGKFT7PhXUj2pr97G5V","path":"0","balanceSat":3304470000,"unconfirmedBalanceSat":0,"transactions":["c11891cb7b264351f442bd2f12de7c4a318018169912960437b97b538727f64f","3d0691c06393f90a27fe01f3248355a8d61f0ff2d171f9d3864e977a1b1c08f9"],"fetchedLast":1540951981535,"used":true,"utxos":[{"script":"76a91462d1715c817093dece27d881af2fbe8391bf18b388ac","satoshis":304470000,"txid":"c11891cb7b264351f442bd2f12de7c4a318018169912960437b97b538727f64f","address":"yVKwyLwGoCTebK5JGKFT7PhXUj2pr97G5V","outputIndex":1},{"script":"76a91462d1715c817093dece27d881af2fbe8391bf18b388ac","satoshis":3000000000,"txid":"c11891cb7b264351f442bd2f12de7c4a318018169912960437b97b538727f64f","address":"yVKwyLwGoCTebK5JGKFT7PhXUj2pr97G5V","outputIndex":0}]}\n'
const start = async () => {
  const wallet = new Wallet({
    network,
    transport,
    privateKey,
    cache:{
      'addresses':JSON.parse(addresses),
      'transactions':JSON.parse(transactions)
    }
  });
  console.log('Private:', wallet.exportWallet());
  console.log('Type:', wallet.type);
  const account = wallet.getAccount(0);

  const address = account.getAddress().address;
  console.log('Address :', address);


  account.events.on('ready', async () => {
    // console.log(account.storage.getStore().wallets['1910f99f7b'].addresses.misc);
    const balance = account.getBalance();
    console.log('balance :', balance);

    const rawtx = account.createTransaction({
      to: address,
      satoshis: balance,
      deductFee: false,
      isInstantSend: true,
    });
    console.log(rawtx);

    // console.log(JSON.stringify(account.storage.store.transactions))
    // const txid = await account.broadcastTransaction(rawtx);
    // console.log('txid:', txid);
  });
};
start();
