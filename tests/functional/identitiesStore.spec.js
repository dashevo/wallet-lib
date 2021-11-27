//[
//         "9Gk9T5mJY9j3dDX1D1tG5WYaV8g6zQTS2ocFFXe6NCrq",
//         null,
//         "HZJywfYZ87fdJFLkp7wtnTfS29zpvR63f21gqaajLYx6"
//       ]

const { expect } = require('chai');
const { IdentitiesStore } = require('../../src');
// const { BlockHeader,Transaction } = require("@dashevo/dashcore-lib");
//
let identitiesStore;
// const testnetBlockHeadersFixtures = require('../../fixtures/chains/testnet/blockheaders.json');
// const testnetTransactionsFixtures = require('../../fixtures/chains/testnet/transactions.json');

describe('IdentitiesStore - Functional', ()=> {
    describe('simple usage', () => {
        it('should create an identityStore', function () {
            identitiesStore = new IdentitiesStore();
        });
        it('should import an identity', function () {
            identitiesStore.importIdentity()
        });
    })
})