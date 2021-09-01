const { expect } = require('chai');

const { Wallet, Identities } = require('../../../index');

let mnemonic;
let privateKey;
let expectedIdentityHDKey0_0;
let expectedIdentityHDKey0_1;
let expectedIdentityHDKey1_0;
let expectedPrivateKeyIdentityHDKey0_0;
let expectedPrivateKeyIdentityHDKey0_1;
let expectedPrivateKeyIdentityHDKey1_0;
let expectedIdentityPrivateKey0_0;
let expectedIdentityPrivateKey0_1;
let expectedIdentityPrivateKey1_0;
let expectedPrivateKeyIdentityPrivateKey0_0;
let expectedPrivateKeyIdentityPrivateKey0_1;
let expectedPrivateKeyIdentityPrivateKey1_0;
let wallet;
let privateKeyWallet;
let identities;
let identitiesPrivateKey;
describe('Identities#getIdentityHDKeyByIndex', function suite() {
  this.timeout(10000);
  beforeEach(() => {
    mnemonic = 'during develop before curtain hazard rare job language become verb message travel';


    expectedIdentityHDKey0_0 = 'tprv8nwXBDgtqkF6xZjxESRmMcmyo8LeJ7YnhEZNYrGBUVDtDbxdtjiQQ5pyVigvrep81EJWenD3BEdCV5Yrhah2tbnzjM5Dq9bnmDvX7yyRHRr';
    expectedIdentityHDKey0_1 = 'tprv8nwXBDgtqkF6z6Da9eSrw29t3qVcHqWTLzw5oFVzXnuxwhRF5RtMmc3LqGMD6NmShVUd4dkbs86PB4pZVQ7xWgg2BLK4Kqm7TDTct4YDifH';
    expectedIdentityHDKey1_0 = 'tprv8oNTEowGNFSSD6Ne3aR9hQXFT2hmvf4F9kgjbbrKmCyeBWbuH9an16tPtKrHtkbAyHofhfGa1Go6a4bZQukJ8qS657PJQEMg3Sq3Z22UnH6';

    expectedIdentityPrivateKey0_0 = '6fcf62a14d7c452a77dee426a534b7c92cbb13a41c3b7f75700519e339ef09dc';
    expectedIdentityPrivateKey0_1 = '5e07be03de51b0c5f7af8d60074819e2cf4bdce8eb47e59c18295e151528390f';
    expectedIdentityPrivateKey1_0 = '276d1d2aa6df3c3b7d9da967641769eddd7e81055833b90a79cdb1b433dd18e5';

    wallet = new Wallet({
      offlineMode: true,
      mnemonic,
    });
    identities = new Identities(wallet);

    expectedPrivateKeyIdentityHDKey0_0 = 'tprv8pFgzqyzYxdnZUWwB89ks9JcgR5tG9ptwLt7CPHHp6P5nxiyKeR8Ua67UHT2zcHCphLa5VGkxD3iaVYLX5DUAUbmG7s86mX9cEJELw7BqjK';
    expectedPrivateKeyIdentityHDKey0_1 = 'tprv8pFgzqyzYxdndJ4ySb2BFKXH5WdAfzrsvsq7Wq1kHq5ZbBdarwwm9DHNCnCB3apbo6KWVMndobMnDRAmWYdpTDVUaPe4A86d327th25bUiC';
    expectedPrivateKeyIdentityHDKey1_0 = 'tprv8p4KPGNbEUDvzXPG6C2msgUBBivDdW8Maa4iWdnjuaBosZr7betmxoEgFDg7oaC3yWf858NRkHEzcKTFebtdxFG6E76iYujv6MJLHs5DHbA';

    expectedPrivateKeyIdentityPrivateKey0_0 = '2532f0b316228b6f0a45be8e1bab4e736a05c7ab63e045232684037aaa216019';
    expectedPrivateKeyIdentityPrivateKey0_1 = '3b227bc1fdc69e1c58af724cd979009cceb5f80af8fcc5d70628df4a5596fa46';
    expectedPrivateKeyIdentityPrivateKey1_0 = 'a31d5c82cee1838e149a157245debdd31a021214d404046edc40b4580dbda328';

    privateKey = 'c3c20b8671481ae69fd329c9e7468386ddf9927a4abef7f450468e4773463ede';
    privateKeyWallet = new Wallet({
      offlineMode: true,
      privateKey,
    });
    identitiesPrivateKey = new Identities(privateKeyWallet);
  });

  afterEach(() => {
    wallet.disconnect();
    privateKeyWallet.disconnect();
  });

  it('Should derive a key for identity for a given index', () => {
    const actualIdentityHDKey0_0 = identities.getIdentityHDKeyByIndex(0, 0);
    const actualIdentityHDKey0_1 = identities.getIdentityHDKeyByIndex(0, 1);
    const actualIdentityHDKey1_0 = identities.getIdentityHDKeyByIndex(1, 0);

    expect(actualIdentityHDKey0_0.toString()).to.be.equal(expectedIdentityHDKey0_0);
    expect(actualIdentityHDKey0_1.toString()).to.be.equal(expectedIdentityHDKey0_1);
    expect(actualIdentityHDKey1_0.toString()).to.be.equal(expectedIdentityHDKey1_0);

    expect(actualIdentityHDKey0_0.privateKey.toString()).to.be.equal(expectedIdentityPrivateKey0_0);
    expect(actualIdentityHDKey0_1.privateKey.toString()).to.be.equal(expectedIdentityPrivateKey0_1);
    expect(actualIdentityHDKey1_0.privateKey.toString()).to.be.equal(expectedIdentityPrivateKey1_0);
  });
  it('Should derive a key for identity from privateKey for a given index', () => {
    const actualIdentityHDKey0_0 = identitiesPrivateKey.getIdentityHDKeyByIndex(0, 0);
    const actualIdentityHDKey0_1 = identitiesPrivateKey.getIdentityHDKeyByIndex(0, 1);
    const actualIdentityHDKey1_0 = identitiesPrivateKey.getIdentityHDKeyByIndex(1, 0);

    expect(actualIdentityHDKey0_0.toString()).to.be.equal(expectedPrivateKeyIdentityHDKey0_0);
    expect(actualIdentityHDKey0_1.toString()).to.be.equal(expectedPrivateKeyIdentityHDKey0_1);
    expect(actualIdentityHDKey1_0.toString()).to.be.equal(expectedPrivateKeyIdentityHDKey1_0);

    expect(actualIdentityHDKey0_0.privateKey.toString()).to.be.equal(expectedPrivateKeyIdentityPrivateKey0_0);
    expect(actualIdentityHDKey0_1.privateKey.toString()).to.be.equal(expectedPrivateKeyIdentityPrivateKey0_1);
    expect(actualIdentityHDKey1_0.privateKey.toString()).to.be.equal(expectedPrivateKeyIdentityPrivateKey1_0);
  });
});
