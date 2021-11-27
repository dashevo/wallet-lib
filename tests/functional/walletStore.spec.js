const { expect } = require('chai');
const { WalletStore } = require('../../src');

let walletStore;
describe('WalletStore - Functional', ()=> {
    describe('simple usage', () => {
        it('should create a walletStore', function () {
            walletStore = new WalletStore();
        });
        it('should create account', function () {
            walletStore.createAccount()
        });
    })
})