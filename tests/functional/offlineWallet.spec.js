const { expect, use} = require('chai');
const { Wallet } = require('../../src/index');
const { Transaction } = require('@dashevo/dashcore-lib');
let offlineWallet;
let account0;
describe('Wallet-lib - functional - offline Wallet', function suite() {
    this.timeout(700000);
    describe('Wallet', () => {
        describe('Create a new offline wallet', () => {
            it('should create a new offline wallet', () => {
                offlineWallet = new Wallet({
                    offlineMode: true,
                    mnemonic: 'replace eternal resource drill side kidney sudden thought account fog fluid wire'
                });
            });
        });
    });

    describe('Account', () => {
        it('should allow to get the first account', async function () {
            account0 = await offlineWallet.getAccount();
            expect(account0.offlineMode).to.equal(true)
            expect(account0.accountPath).to.equal(`m/44'/1'/0'`)
        });
        it('should get all addresses', function () {
            const externalAddressesSet = account0.getAddresses();
            const internalAddressesSet = account0.getAddresses('internal');
            expect(Object.keys(externalAddressesSet)).to.deep.equal([
                'm/0/0',  'm/0/1',  'm/0/2',
                'm/0/3',  'm/0/4',  'm/0/5',
                'm/0/6',  'm/0/7',  'm/0/8',
                'm/0/9',  'm/0/10', 'm/0/11',
                'm/0/12', 'm/0/13', 'm/0/14',
                'm/0/15', 'm/0/16', 'm/0/17',
                'm/0/18', 'm/0/19'
            ])
            expect(Object.keys(internalAddressesSet)).to.deep.equal([
                'm/1/0',  'm/1/1',  'm/1/2',
                'm/1/3',  'm/1/4',  'm/1/5',
                'm/1/6',  'm/1/7',  'm/1/8',
                'm/1/9',  'm/1/10', 'm/1/11',
                'm/1/12', 'm/1/13', 'm/1/14',
                'm/1/15', 'm/1/16', 'm/1/17',
                'm/1/18', 'm/1/19'
            ])
        });
        it('should generate new address on tx affecting address', function () {
            expect(account0.getUnusedAddress()).to.deep.equal({
                    address: 'yVSuCVTGpViqV8bzG3kdtofkPhSRWH8dbq',
                    path: 'm/0/0',
                    index: 0
                });
            const transactionsWithMetadata = [
                [
                    new Transaction('0200000001c7d66bb85e0069c221b44b07f49f52cc4f2e54f70e14430b94888327763a66a9010000006b483045022100da5b319f73e6adfee751f33308f5a8c1fceeab2683e15e132d79053b3118639602204262022fb85f88d9802649a289a1134b678efcf708faaeae8f101e8eab785054012102bc626898b49f31f5194de7bc68004401639a20cfa82e4c2eac9684a91fc47a57feffffff0270f2f605000000001976a91464220a1c12690ec26d837b3be0a2e3588bb4b79188ac912e250c250000001976a91415e1edb5c5d9e67d0e36f94343b3eff26bb76d1088ac266e0900'),
                    {"blockHash":"0000005c81a683007e86e75c76b4b2feca229f806702ca92953562f2ae628ce7","height":618023,"instantLocked":true,"chainLocked":true}
                 ]
            ]
            account0.importTransactions(transactionsWithMetadata);
            expect(account0.getUnusedAddress()).to.deep.equal({
                address: 'yWFHBxc6c9jmkL82v795PtJJteSkcVKbt5',
                path: 'm/0/1',
                index: 1
            });
            expect(account0.getTotalBalance()).to.equal(100070000);
            expect(account0.getUTXOS().length).to.equal(1);
            const utxo = account0.getUTXOS()[0];
            expect(utxo.toString()).to.equal('61e5a9ffbf505ad9e5b0a715673ec3c89d68dc9b1d1af8fd980240b8ac14c29c:0');
            expect(utxo).to.deep.equal(new Transaction.UnspentOutput({"address":"yVSuCVTGpViqV8bzG3kdtofkPhSRWH8dbq","txid":"61e5a9ffbf505ad9e5b0a715673ec3c89d68dc9b1d1af8fd980240b8ac14c29c","vout":0,"scriptPubKey":"76a91464220a1c12690ec26d837b3be0a2e3588bb4b79188ac","amount":1.0007}))
            expect(account0.getPrivateKeys([utxo.address.toString()])[0].toString()).to.equal('tprv8k5Lf2T5uY7BZVxCvssWR9txCj5rEvT19Nd291gfuDJf1wnibAB9GTRzke7FvwKnpXBYiYWvjthnnCWPFUvJbsN3StwcL63EnJNcMSmorfC')
        });
        it('should have issued new addresses', function () {
            const externalAddressesSet = account0.getAddresses();
            expect(Object.keys(externalAddressesSet)).to.deep.equal([
                'm/0/0',  'm/0/1',  'm/0/2',
                'm/0/3',  'm/0/4',  'm/0/5',
                'm/0/6',  'm/0/7',  'm/0/8',
                'm/0/9',  'm/0/10', 'm/0/11',
                'm/0/12', 'm/0/13', 'm/0/14',
                'm/0/15', 'm/0/16', 'm/0/17',
                'm/0/18', 'm/0/19', 'm/0/20'
            ])
        });
        it('should be able to create and sign transaction', function () {
            const tx = account0.createTransaction({
                recipient: 'yVSuCVTGpViqV8bzG3kdtofkPhSRWH8dbq',
                satoshis: 100000
            })
            expect(tx.isFullySigned()).to.equal(true);
        });
    });
});
