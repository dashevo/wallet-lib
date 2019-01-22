const { expect } = require('chai');
const Dashcore = require('@dashevo/dashcore-lib');
const createTransaction = require('../../src/Account/createTransaction');
const addressesFixtures = require('../fixtures/addresses.json');
const validStore = require('../fixtures/walletStore').valid.orange.store;

describe('Account - createTransaction', () => {
  it('sould warn on missing inputs', () => {
    const self = {
      store: validStore,
      walletId: 'a3771aaf93',
      getUTXOS: require('../../src/Account/getUTXOS'),
    };

    const mockOpts1 = {};
    const mockOpts2 = {
      satoshis: 1000,
    };
    const mockOpts3 = {
      satoshis: 1000,
      recipient: addressesFixtures.testnet.valid.yereyozxENB9jbhqpbg1coE5c39ExqLSaG.addr,
    };
    const expectedException1 = 'An amount in dash or in satoshis is expected to create a transaction';
    const expectedException2 = 'A recipient is expected to create a transaction';
    const expectedException3 = 'Error: utxosList must contain at least 1 utxo';
    expect(() => createTransaction.call(self, mockOpts1)).to.throw(expectedException1);
    expect(() => createTransaction.call(self, mockOpts2)).to.throw(expectedException2);
    expect(() => createTransaction.call(self, mockOpts3)).to.throw(expectedException3);
  });
  it('should be able to have a passed change address', ()=>{

  })
});
