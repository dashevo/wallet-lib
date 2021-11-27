const { expect } = require('chai');
const { Storage } = require('../../src');

let storage;
describe('Storage - Functional', ()=> {
    describe('simple usage', () => {
        it('should create a storage', function () {
            storage = new Storage();
        });
        it('should create a chain', function () {
            storage.createChainStore('testnet')
        });
        it('should get a chain store', function () {
            const chainStore = storage.getChainStore('testnet')
            expect(chainStore.network).to.equal('testnet');
            expect(chainStore.state.blockHeight).to.equal(0);
        });
        it('should create a wallet', function () {
            storage.createWalletStore('73a5575413')
        });
        it('should get a wallet store', function () {
            const walletStore = storage.getWalletStore('73a5575413')
            expect(walletStore.walletId).to.equal('73a5575413');
        });
        it('should create paths store', function () {
            const walletStore = storage.getWalletStore('73a5575413')
            // const publicKeyStore = walletStore.createPathStore(`m/0'`);
            const accountStore = walletStore.createPathState(`m/44'/1'/0'`);
            // const contactReceivingStore = walletStore.createPathStore(`m/9'/1'/15'/0'/123/456`);
        });
        it('should ', function () {
            
        });
    })
})