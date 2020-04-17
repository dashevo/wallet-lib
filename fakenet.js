const Fakenet = require('./fixtures/FakeNet/FakeNet');
const { Wallet } = require('./src/index');

const wallet = new Wallet({
  // mnemonic: 'during develop before curtain hazard rare job language become verb message travel',
  mnemonic: 'prison crater purchase explain gate pepper cash nominee enroll either gossip dune',
  transporter: Fakenet
});

const start = async function(){
  const account = wallet.getAccount();
  await account.isReady();
  const tx = account.createTransaction({
    recipients:[
      {
        address: 'yMGXHsi8gstbd5wqfqkqcfsbwJjGBt5sWu',
        satoshis: 90000000
      },{
        address: 'yLeqoVqqGf4hFDwsiJwKiLPpeJbZHJpwo7',
        satoshis: 90000000
      },{
        address: 'yWCxg5NdRXDagFokjwdLMYNDqfEKmLPtua',
        satoshis: 90000000
      },{
        address: 'ySPghvb9M1PqjhRYKv7iivQEuebM2aXs9f',
        satoshis: 90000000
      },{
        address: 'yR8bXVFZAM1ysc8s4GfVTirNhTEzKizY19',
        satoshis: 90000000
      },{
        address: 'yhoCPK6WyqtB5GmZjVqxy3faR5JMUKbt8x',
        satoshis: 90000000
      },{
        address: 'yTJbGkT7TYVY4MYbTgdSDdq19A3VmjyEUo',
        satoshis: 90000000
      },{
        address: 'yNtvF5g6qnbRsUJ8ggap3pd53HEmkngEJu',
        satoshis: 90000000
      },{
        address: 'yia3dGyRdh7xZLDtum1rdCLRqabyBQbcWL',
        satoshis: 90000000
      },{
        address: 'yXbuPCJagq4XH85hgxqsNv92kSUFroTWUA',
        satoshis: 90000000
      },
    ]
  });
  const tx1 = '0300000001b64e23b6bd8c1016c8595ab6256e97ac5a33a95b5c68cc99410bf88867023910000000006b483045022100fc88e4585654961610e375b19f33b52d10e1c7efa5ef91531c627129538cf7ef0220108a281374a691522b5deb51ce3249723efe9541e57a4de87bdd8ba7ce43ce8e012103987110fc08c848657176385b37a77fb7f6d89bc873bb4334146ffe44ac126566ffffffff0b804a5d05000000001976a9140a6a961f1c664a9cd004c593381dd4d9f1f5463588ac804a5d05000000001976a91403ab1053a3bc741a012607893c66565c6815b9d888ac804a5d05000000001976a9146c773e3b74a16931f995288645f4f6379076048688ac804a5d05000000001976a914429dfc6b9a9d86463ea65b55d8cedb26a5e04f3388ac804a5d05000000001976a91434cb4bfb6e27ed0067e47c55da615bf7230e23f888ac804a5d05000000001976a914eb9a36fab9220e5e966fdcfe1abf2ee43308cb5d88ac804a5d05000000001976a9144c9f7ef1c5af5f0d2b219a035a46c7f54035b0a288ac804a5d05000000001976a9141c44d8966f001ddb7cea277edc33b02f151b603788ac804a5d05000000001976a914f4159f063a076038a484cf9d027808dbac118a1a88ac804a5d05000000001976a9147bc630538f5bb87d3166b6cf5f69853809235f4388acdcdef505000000001976a9140a6a961f1c664a9cd004c593381dd4d9f1f5463588ac00000000';

  console.log(tx.toString('hex'), tx.toString('hex') === tx1);
  // fakenet.setHeight(21546);
  // console.log(await fakenet.getTransaction("1039026788f80b4199cc685c5ba9335aac976e25b65a59c816108cbdb6234eb6"));
  // console.log(fakenet)
  // console.log(await fakenet.getUTXO(['yQ1fb64aeLfgqFKyeV9Hg9KTaTq5ehHm22']));

  // console.log(fakenet)
};
start();
