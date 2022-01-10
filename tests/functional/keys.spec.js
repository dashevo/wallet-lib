const { expect } = require('chai');
const { HDPrivateKey, HDPublicKey, Mnemonic } = require('@dashevo/dashcore-lib');
const { KeyChain, KeyChainStore, CONSTANTS: { BIP44_ADDRESS_GAP, BIP44_TESTNET_ROOT_PATH } } = require('../../src');
const getBIP44AccountPath = require("../../src/utils/bip44/getBIP44AccountPath");

const mnemonic = new Mnemonic('one dumb media liquid zero apple jeans nurse click busy cannon number');

const DPFriendReceivingHDPrivateKey = new HDPrivateKey('tprv8ZgxMBicQKsPfALquMaAd23GpFgRB7oJVa3pWPjLDf6rAhyNcttncn7hbALux3SUsohPuviHDJfC7LjZQgZjHhWsP1RYGx3vjkWuzXuZ9WZ');
const DPFriendHDPublicKey = new HDPublicKey('tpubD6NzVbkrYhZ4XLcVv7LhkVJRkZVUy185BeeAoBD94uDoHTNMupQFGkAMgAkPKy6mb3CMSKmqMdJ6JMm4gy7tcfBADWRuiqLoGHtktaPc8Ep');
describe('Keys - Functional', ()=>{
    describe('simple usage', ()=>{
        let walletKeyChainStore;
        let walletKeyChain;
        it('should be able to setup a walletKeyChain to a walletKeyChainStore ', function () {
            walletKeyChainStore = new KeyChainStore();
            walletKeyChain = new KeyChain({
                network: 'testnet',
                mnemonic
            });
            expect(walletKeyChain.rootKeyType).to.equal(HDPrivateKey.name);
            expect(walletKeyChain.network).to.equal('testnet');
            expect(walletKeyChain.rootKey.toString()).to.equal('tprv8ZgxMBicQKsPeu48xtibzy9daEN1arEjRCe6iSZp2rXxV8pk27SPYvEyYirgMJnS8FdJREBddHW3nGckS9PT284hPVGCfDoUMiXxhaSXQvn');

            const walletKeyChain2 = new KeyChain({
                network: 'livenet',
                mnemonic
            });
            expect(walletKeyChain2.rootKey.toString()).to.equal('xprv9s21ZrQH143K45pcJKs6qKXeG6woMLCj5eiyr29MYt3UhY5f2k6e3AsXdYh2LwQ7kp6XR8ZsTvvFKR51Jw3WD4o6rr3tzs5RScnYFs46Apa');

            walletKeyChainStore.addKeyChain(walletKeyChain, { isMasterKeyChain: true });
            expect(walletKeyChainStore.getMasterKeyChain()).to.deep.equal(walletKeyChain)
        });
        it('should get any accountKeyChainStore and its accountKeyChain', function () {
            const accountKeyChainStore0 = walletKeyChainStore.makeChildKeyChainStore(getBIP44AccountPath(0, 'testnet'));
            const accountKeyChain0 = accountKeyChainStore0.getMasterKeyChain();
            expect(accountKeyChain0.rootKey.toString()).to.equal('tprv8gNcoB29rES5PBtjviTp3iK4Vu4BA4rrxsU6gVtjzRwnSDhAQVx5WH32U6Z76Cmge1eBrfaaku9tJonAStBPDvYn9bRQEFi5d4nU9TZ5KK7')

            const accountKeyChainStore1 = walletKeyChainStore.makeChildKeyChainStore(getBIP44AccountPath(1, 'testnet'));
            const accountKeyChain1 = accountKeyChainStore1.getMasterKeyChain();
            expect(accountKeyChain1.rootKey.toString()).to.equal('tprv8gNcoB29rES5PR9P3uJixRXtB7VjamA9QM6gKXmw8gxoGVbqfJsi1U6A92gpdegjAYx4PJ5HLzB33MdPZnpsq6ejYcnb5YjfZsADNrDmebA')
        });

        it('should get any address', function () {
            const accountKeyChain0 = walletKeyChainStore
                .makeChildKeyChainStore(getBIP44AccountPath(0, 'testnet'))
                .getMasterKeyChain();

            const accountExternalAddress0 = accountKeyChain0.getForPath(`m/0/0`).address;
            expect(accountExternalAddress0.toString()).to.equal('yQH4MsDtfti8xnpagDZVLGHueZE4jEcEfj')
            const accountInternalAddress0 = accountKeyChain0.getForPath(`m/1/0`).address;
            expect(accountInternalAddress0.toString()).to.equal('yjcnQuzZwhrFnUDA2Kj4GbtTjB7qpZaqq6')
        });
        it('should get the signing key for an address', function () {
            const accountKeyChain0 = walletKeyChainStore
                .makeChildKeyChainStore(getBIP44AccountPath(0, 'testnet'))
                .getMasterKeyChain();

            const accountExternalAddress0 = accountKeyChain0.getForPath(`m/0/0`).address;

            const signingKey = accountKeyChain0.getForAddress(accountExternalAddress0).key;
            expect(signingKey.toString()).to.equal('tprv8jCCNzw9WdTAroytWTx4nJcWgykYLB9bnL8MWk62yJW5WSoznEoUVNzZtFPYTHQURxiAHh3yLQi5v91jtbW7AxDfu14wy78V59spYG5ETAc')
            expect(signingKey.privateKey.toString()).to.equal('bdf5982ff67da261a31451933636825021e67be9289c9ec522087788f5593098')
        });
    })
    describe('Gapped usage with watching and marking of address', ()=>{
        const walletKeyChainStore = new KeyChainStore();
        const walletKeyChain = new KeyChain({
            network: 'testnet',
            mnemonic,
        });
        walletKeyChainStore.addKeyChain(walletKeyChain, { isMasterKeyChain: true })

        let accountKeyChain0;
        it('should set keychain with gap', function () {
            const lookAheadOpts = {
                paths: {
                    'm/0': BIP44_ADDRESS_GAP,
                    'm/1': BIP44_ADDRESS_GAP
                }
            }
            accountKeyChain0 = walletKeyChainStore
                .makeChildKeyChainStore(
                    getBIP44AccountPath(0, 'testnet'),
                    { lookAheadOpts }
                )
                .getMasterKeyChain();
            expect(accountKeyChain0.lookAheadOpts).to.deep.equal({isWatched:true, ...lookAheadOpts})
            expect(BIP44_ADDRESS_GAP).to.equal(20)
        });

        it('should have 20 internal and external set as issued address', function () {
            expect(Array.from(accountKeyChain0.issuedPaths.keys())).to.deep.equal([
                'm/0/0',  'm/0/1',   'm/0/2',
                'm/0/3',  'm/0/4',   'm/0/5',
                'm/0/6',  'm/0/7',   'm/0/8',
                'm/0/9',  'm/0/10',  'm/0/11',
                'm/0/12', 'm/0/13',  'm/0/14',
                'm/0/15', 'm/0/16',  'm/0/17',
                'm/0/18', 'm/0/19',  'm/1/0',
                'm/1/1',  'm/1/2',   'm/1/3',
                'm/1/4',  'm/1/5',   'm/1/6',
                'm/1/7',  'm/1/8',   'm/1/9',
                'm/1/10', 'm/1/11',  'm/1/12',
                'm/1/13', 'm/1/14',  'm/1/15',
                'm/1/16', 'm/1/17',  'm/1/18',
                'm/1/19'
            ])
        });
        it('should have 20 internal and external to watched address', function () {
            expect(accountKeyChain0.getWatchedAddresses()).to.deep.equal([
                'yQH4MsDtfti8xnpagDZVLGHueZE4jEcEfj',
                'yZA33e7ojAvegoCELThDzt1Ywnpf86CDtc',
                'yZhFqYxNyvD4J4ySQzfCfLkGG3k9wnSx9C',
                'yfZ2NijF39BH11dLEzSZJhYSZSoeUHhKv2',
                'ydYVMsNn6QzzivjyqdqgRPT1yLh81ycZ3W',
                'yXd5TLmqBmPLQSpdGBwgB7JB34JBmWkWUp',
                'yaHEgNjWHXHFirCTZQkRkSiGhz6xaWN7he',
                'yWdHf3g4FhCfNbP6LoZTi12jy1u7hh5iZ9',
                'yj6WzZLtT1Nby9dsDNo988QzqAchjfz6cw',
                'yifEMSD9SQTu9tmyft4d3aTvQh82afxkdK',
                'yaXCzdyL4LCui8SffErsPSr7dU6jV3zftj',
                'yPfH7yfbsHkqSezzMfDbReyLaw1hcwtxHw',
                'ybmmVgnfpzsEVwk269vsBgkZdgBUbkbxcb',
                'ygDCyp8yndRq9bNZetuDLzC3uByuf2aH3a',
                'ycwrVbzQy8PPpaJME9uutAjy8vAuAKpNuF',
                'yjd8ThFK8oCK5TKk7inUtUWh2AtNTtcJyu',
                'yYcb4K5aba3a96WNxoeoaqRgfXdz8uTAtP',
                'ydVPiyNEvFqNWgdpXiavRrkm1NoJexw9op',
                'yQjqbHEcK2b8Tw18j4aMnLJWrBM3hMd2jY',
                'yMindyX74LaHdkdxGemyxjPWgmdaPAQHV5',
                'yjcnQuzZwhrFnUDA2Kj4GbtTjB7qpZaqq6',
                'ycMG3EvpsaodChznzoW6d6TK2AJCXCofvK',
                'yeBmB9zZm54xG13qPe4uouBee1P41NPoFG',
                'yMc5SbTnRwuoNyx4hpBkJ2yULdYG7cmPrR',
                'yQgnwDHQNm3zXY24MpSbxpkhmsYfTCV2uf',
                'yazGoXCSRj3d7H7y8D9FBo34KN1rxWRTxj',
                'yMNPrtNdAD5nET98tVqUHU4j64oAuwEdZT',
                'ySHYJjCXe2q5qv4WqDHssYBzhq1MUwNC94',
                'yi5LCMKMGGv8ELhec8hJHQzD7tgVZka74T',
                'yNKFzqLWQyQNoTCuzayLgzLtAkVr1Cr97A',
                'yRgg5gBFtzuvMUT8vZRUH5mJS3DV7Jr2r6',
                'yduxdiYt2GZEv77kdyuPWRwEnFJNnGPSWK',
                'yb45zLKCAEvMpKMmQ9k3vv81g63PDCe5Mk',
                'ySxrW1JpQwx9HN9cYGnsYX99Tie95KDJfK',
                'yVXV45Gybn7QpqoRVDC9cBSiQdTsJ4rHSE',
                'yaj2HUVuPzJdXcpDh8jYyeQ9TVLPAE2Caa',
                'yZBjfbFMih1tf2i7zABdeuJkeJ3PLD2ecY',
                'yW7iE3DmqpM1etQWquToC3LsSNGw8r3Z9r',
                'yasbGEiKerEZiYvQDB2YfDEqX8pzf4GBjm',
                'yivH7ouWmGkkpwHtXfQxYK3YM1ct15q75o'
            ]);
        });
        it('should mark address as used and generate as per gap', function () {
            accountKeyChain0.markAddressAsUsed('yQH4MsDtfti8xnpagDZVLGHueZE4jEcEfj');
            expect(Array.from(accountKeyChain0.issuedPaths.keys()))
                .to.deep.equal([
                'm/0/0',  'm/0/1',   'm/0/2',
                'm/0/3',  'm/0/4',   'm/0/5',
                'm/0/6',  'm/0/7',   'm/0/8',
                'm/0/9',  'm/0/10',  'm/0/11',
                'm/0/12', 'm/0/13',  'm/0/14',
                'm/0/15', 'm/0/16',  'm/0/17',
                'm/0/18', 'm/0/19',  'm/1/0',
                'm/1/1',  'm/1/2',   'm/1/3',
                'm/1/4',  'm/1/5',   'm/1/6',
                'm/1/7',  'm/1/8',   'm/1/9',
                'm/1/10', 'm/1/11',  'm/1/12',
                'm/1/13', 'm/1/14',  'm/1/15',
                'm/1/16', 'm/1/17',  'm/1/18',
                'm/1/19', 'm/0/20'
            ])
            expect(accountKeyChain0.getWatchedAddresses()).to.deep.equal([
                'yQH4MsDtfti8xnpagDZVLGHueZE4jEcEfj',
                'yZA33e7ojAvegoCELThDzt1Ywnpf86CDtc',
                'yZhFqYxNyvD4J4ySQzfCfLkGG3k9wnSx9C',
                'yfZ2NijF39BH11dLEzSZJhYSZSoeUHhKv2',
                'ydYVMsNn6QzzivjyqdqgRPT1yLh81ycZ3W',
                'yXd5TLmqBmPLQSpdGBwgB7JB34JBmWkWUp',
                'yaHEgNjWHXHFirCTZQkRkSiGhz6xaWN7he',
                'yWdHf3g4FhCfNbP6LoZTi12jy1u7hh5iZ9',
                'yj6WzZLtT1Nby9dsDNo988QzqAchjfz6cw',
                'yifEMSD9SQTu9tmyft4d3aTvQh82afxkdK',
                'yaXCzdyL4LCui8SffErsPSr7dU6jV3zftj',
                'yPfH7yfbsHkqSezzMfDbReyLaw1hcwtxHw',
                'ybmmVgnfpzsEVwk269vsBgkZdgBUbkbxcb',
                'ygDCyp8yndRq9bNZetuDLzC3uByuf2aH3a',
                'ycwrVbzQy8PPpaJME9uutAjy8vAuAKpNuF',
                'yjd8ThFK8oCK5TKk7inUtUWh2AtNTtcJyu',
                'yYcb4K5aba3a96WNxoeoaqRgfXdz8uTAtP',
                'ydVPiyNEvFqNWgdpXiavRrkm1NoJexw9op',
                'yQjqbHEcK2b8Tw18j4aMnLJWrBM3hMd2jY',
                'yMindyX74LaHdkdxGemyxjPWgmdaPAQHV5',
                'yjcnQuzZwhrFnUDA2Kj4GbtTjB7qpZaqq6',
                'ycMG3EvpsaodChznzoW6d6TK2AJCXCofvK',
                'yeBmB9zZm54xG13qPe4uouBee1P41NPoFG',
                'yMc5SbTnRwuoNyx4hpBkJ2yULdYG7cmPrR',
                'yQgnwDHQNm3zXY24MpSbxpkhmsYfTCV2uf',
                'yazGoXCSRj3d7H7y8D9FBo34KN1rxWRTxj',
                'yMNPrtNdAD5nET98tVqUHU4j64oAuwEdZT',
                'ySHYJjCXe2q5qv4WqDHssYBzhq1MUwNC94',
                'yi5LCMKMGGv8ELhec8hJHQzD7tgVZka74T',
                'yNKFzqLWQyQNoTCuzayLgzLtAkVr1Cr97A',
                'yRgg5gBFtzuvMUT8vZRUH5mJS3DV7Jr2r6',
                'yduxdiYt2GZEv77kdyuPWRwEnFJNnGPSWK',
                'yb45zLKCAEvMpKMmQ9k3vv81g63PDCe5Mk',
                'ySxrW1JpQwx9HN9cYGnsYX99Tie95KDJfK',
                'yVXV45Gybn7QpqoRVDC9cBSiQdTsJ4rHSE',
                'yaj2HUVuPzJdXcpDh8jYyeQ9TVLPAE2Caa',
                'yZBjfbFMih1tf2i7zABdeuJkeJ3PLD2ecY',
                'yW7iE3DmqpM1etQWquToC3LsSNGw8r3Z9r',
                'yasbGEiKerEZiYvQDB2YfDEqX8pzf4GBjm',
                'yivH7ouWmGkkpwHtXfQxYK3YM1ct15q75o',
                'yNti2kmrf8rXDvqB8ydSbwpkfuVEb2HUrQ'
            ]);
        });
    });
    describe('DashPay - ContactKeyChain', ()=>{
        const keyChainStore = new KeyChainStore();
        const walletKeyChain = new KeyChain({
            network: 'testnet',
            mnemonic,
        });
        const lookAheadOpts = {
            paths: {
                'm/0': BIP44_ADDRESS_GAP,
                'm/1': BIP44_ADDRESS_GAP
            }
        }
        keyChainStore.addKeyChain(walletKeyChain, { isMasterKeyChain: true })
        const accountKeyChainStore = keyChainStore
            .makeChildKeyChainStore(getBIP44AccountPath(0, 'testnet'), {lookAheadOpts})

        it('should add a receiving keychain', function () {
            const lookAheadOpts = {
                paths:{
                    'm/0': 10,
                    'm/1': 10
                },
            }
            const contactReceivingKeyChain = new KeyChain({
                network: 'testnet',
                HDPrivateKey: DPFriendReceivingHDPrivateKey,
                lookAheadOpts
            });
            accountKeyChainStore.addKeyChain(contactReceivingKeyChain)
            expect(Array.from(contactReceivingKeyChain.issuedPaths.keys())).to.deep.equal([
                'm/0/0',
                'm/0/1',
                'm/0/2',
                'm/0/3',
                'm/0/4',
                'm/0/5',
                'm/0/6',
                'm/0/7',
                'm/0/8',
                'm/0/9',
                'm/1/0',
                'm/1/1',
                'm/1/2',
                'm/1/3',
                'm/1/4',
                'm/1/5',
                'm/1/6',
                'm/1/7',
                'm/1/8',
                'm/1/9'
            ])
            expect(contactReceivingKeyChain.getWatchedAddresses()).to.deep.equal([
                'ygXopQ36SWcK56fy6rD6qiogZcRv3HxMRw',
                'ygeagGpXd8tWFCNSYjYs1PnGKVSgvg5ndr',
                'yddpt9d3JttZeRHtuXMmp2pqiBmZRpf5bM',
                'yg61bJDLee3VRErvm5zVi2f7bBPQkVHSUo',
                'yT1sPoqaWf4Yu4Ddm3huGc72DBixLsQVD5',
                'yPvPxvoWFn1KCGRmtqwAzHBaS8UDq2kj6U',
                'yNNmU45y9tmgdq8BLtZzNAYxSPovhnTnkA',
                'yS7LoFDvrNfa6uNqNr1rKRAUU7HRKux3rm',
                'yjGhDPFwKWvBH5RqhimJUeKfh4723SyZSw',
                'yUMVKzNBo29N9G8fYWpGH4t7ka7Pxoxp1g',
                'yjSZFPSMMjW94gxky8GzNrDmibvCZsHeev',
                'yVEJExicNKEwAQR6hZpoKVjDpS6KQTXxRT',
                'yae21tB2umekfyNSCRiv2efCuC5AuJxUjx',
                'yWKMoKkMs9cY5ZrG1T8TUv5XJngw32H3JP',
                'yXpTUWPFzAVgfNS31AH5SgNfcGm2uhhXej',
                'yfQdpiNbnPDPY7qm91R9jx865fdpgsQUt5',
                'yQpGvLZ1wg5rBTt6BANb5pHj7nVm1yGsom',
                'yUxmwPFvtSiCXySoQXNY5xhTU4RZrJdMLE',
                'yUHCHewhGZrpDgJEiA3QeZqabBu53u7WBD',
                'yLzzpBayHs94ZDHukJL6KTzkFPvfyE2SZc'
            ])
        });
        it('should add a sending keychain', function () {
            const lookAheadOpts = {
                paths:{
                    'm/0': 10,
                    'm/1': 10
                },
            }
            const contactSendingKeyChain = new KeyChain({
                network: 'testnet',
                HDPublicKey: DPFriendHDPublicKey,
                lookAheadOpts
            });
            accountKeyChainStore.addKeyChain(contactSendingKeyChain)

            expect(Array.from(contactSendingKeyChain.issuedPaths.keys())).to.deep.equal([
                'm/0/0',
                'm/0/1',
                'm/0/2',
                'm/0/3',
                'm/0/4',
                'm/0/5',
                'm/0/6',
                'm/0/7',
                'm/0/8',
                'm/0/9',
                'm/1/0',
                'm/1/1',
                'm/1/2',
                'm/1/3',
                'm/1/4',
                'm/1/5',
                'm/1/6',
                'm/1/7',
                'm/1/8',
                'm/1/9'
            ])
            expect(contactSendingKeyChain.getWatchedAddresses()).to.deep.equal([
                'ycjHcm5BTWNgucy5dZGy8ELRvLptxZKvkr',
                'yMNYq1LoSLCH6Bta4T7hbDdNmsLNqi47Ua',
                'ybca2FKwup3y2fsfVz9KABx81JtDH7F4zX',
                'yQrtYuoWfKv6BKY1xBqQVLnGvf4up3TsWo',
                'yWhMUL65dFoPbCZyW286QAZCjdSmLVcqQa',
                'yanMQ79PN5nTK6UwhpdUpiPAkRYoAe5UbZ',
                'yYq1LRkdvDxF7Spk8KPyUmPmHdbf9qmW4E',
                'yVuNQ412G8JvGYmdamwcHPNTmUqzWemJMx',
                'ycodktzX9pYAE29vUs8bVQquAkVUbZVuv2',
                'ybPry3LB5RH4CabqqAjm3QkN9n7PtLQvzJ',
                'yUfPQaqcZ8cviuhrmvi8mU7XykYL3WfCse',
                'ySzzXYet9CdBCpYgGMBu2GKPbtjBhXkDoU',
                'yfz51NpWoR6JvnMhkB1RTKWaCvyXfmudio',
                'yVQ5CtUUSNLEHSzR1EJ1y8GNEWorCP8ape',
                'ycEzBg7S85Qk13CjbfJzmtDda8sQKQc33Z',
                'yVrZBeUEYGNw3jY7PX37zcGh7t1qzvYbJc',
                'yVtfJdLKxhyoEHAuhwDSdd1UZcHQuVZH6D',
                'yZbCr237LvakaR2UHW8aqiQztX9xXSWK4o',
                'ySw8JxoCuqvzb5AWV8ZY7RkSEvzzh2bpu2',
                'yRZ2WPrNeTHH1G7nFD63Su5qwhfuKMruLU'
            ])
        });
        it('should get watched address from all keychain', function () {
            const addresses = [];
            for(let [keychainId, keychain] of accountKeyChainStore.keyChains){
                addresses.push(...keychain.getWatchedAddresses())
            }
            expect(addresses.length).to.equal(80);
        });
    })
});

