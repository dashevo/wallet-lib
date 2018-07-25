# Wallet Library
=====================

[![NPM Package](https://img.shields.io/npm/v/@dashevo/wallet-lib.svg?style=flat-square)](https://www.npmjs.org/package/@dashevo/wallet--lib)
[![Build Status](https://img.shields.io/travis/dashevo/wallet-lib.svg?branch=master&style=flat-square)](https://travis-ci.org/dashevo/wallet-lib)
[![Coverage Status](https://img.shields.io/coveralls/dashevo/wallet-lib.svg?style=flat-square)](https://coveralls.io/github/dashevo/wallet-lib?branch=master)

A pure and powerful Wallet Library for Dash - Layer 1

See also : [DAP-SDK](https://github.com/dashevo/dap-sdk)

## Principles

Dash is a powerful new peer-to-peer platform for the next generation of financial technology. The decentralized nature of the Dash network allows for highly resilient Dash infrastructure, and the developer community needs reliable, open-source tools to implement Dash apps and services.


## Install

### NodeJS :

`npm install @dashevo/wallet-lib`

### Browser

## Usage

### Instantiate

```
const { Wallet } = require('@dashevo/wallet-lib');
const { DAPIClient } = require('@dashevo/dapi-client');
const { Mnemonic } = require('@dashevo/dashcore-lib');

const mnemonic = null;// Change this by your mnemonic string or object
const network = 'testnet' // or 'livenet'

const options = {
    transport:new DAPIClient(), // without any transport layer, all method linked to UTXO, balance... won't be available
    mnemonic,
    network
}
const wallet = new Wallet(options)
```

### Create an account
```
const options = { mode: 'full' } // (default : full) - Also light, that will not pre-derive 20 address
const account = wallet.createAccount(options);
```

### Pay to an address
```
const options = {
    to: "yizmJb63ygipuJaRgYtpWCV2erQodmaZt8",
    satoshis:100000,
    isInstantSend:false
};
const rawtx = account.createTransaction(options);
const txid = account.broadcastTransaction(rawtx);
```

### Get Account

`const account = wallet.getAccount()`

Additional parameters :
 - accountId : Integer - Default : `0`

### Get Unused Address

`const address = account.getUnusedAddress()`

Additional parameters :
 - isExternal : Boolean - Default : `true`
 - skip : Integer - Default : `0`

### Get Private Keys

`const privateKeys = account.getPrivateKeys(addressList)`

Parameters :
- addressList : Array<String> - required

### Sign

`const signedTransaction = account.sign(transaction, privatekeys, sigtype)`

### Get Balance

`const balance = account.getBalance()`

### Get UTXO

`const utxos = account.getUTXOS()`

Additional parameters :
 - onlyAvailable : Boolean - Default : `true`

## Features

BIPS Supports :

- [x] BIP32 (Hierarchical Deterministic Wallets)
- [ ] BIP38 (Passphrase protected private key)
- [x] BIP39 (Mnemonic code for generating deterministic keys)
- [x] BIP43 (Purpose field for deterministic wallets)
- [x] BIP44 (Multi-Account Hierarchy for Deterministic Wallets)

Miscellaneous :

- [ ] DAPI Support
- [ ] Protocol Support
- [ ] Persistance interface
    - [ ] In-mem support
    - [ ] DB support
- [x] HDWallet : Create a wallet / generate a new mnemonic
- [x] HDWallet : Validate mnemonic (BIP39)
- [x] HDWallet : Create an account
- [x] HDWallet : Address Derivation
- [x] HDWallet : Encrypt PrivKey (BIP38) - Passphrase Protection
- [x] HDWallet : Import (Mnemonic, HDPrivKey)
- [x] HDWallet : Export (Mnemonic, HDPrivKey)
- [x] Discovery : Discover existing account
- [ ] Discovery : Discover existing address / change
- [x] Transaction : Create transaction (rawtx)
- [x] Transaction : Broadcast transaction
- [ ] Transaction : History fetching
- [x] Transaction : Balance
- [x] Transaction : InstantSend
- [x] UTXO Optimisation / CoinSelection
- [x] Fee estimation
- [ ] Bloomfilters
- [ ] Compatibility with old format (BIP32)
- [ ] Paper-sweep wallet

Transports :

- [ ] DAPI-Client : [https://github.com/dashevo/dapi-client]
- [ ] Insight- Client : [src/transports/Insight/insightClient.js]
- [ ] Dash-P2P : [src/transports/Protocol/protocolClient.js]
- [ ] DashcoreRPC : [src/transports/RPC/rpcClient.js]

Adapters (help from community welcomed) :

- [ ] LocalStorage
- [ ] SecureStorage
- [ ] LevelDB
- [ ] MongoDB
- [ ] BerkeleyDB
- [ ] LowDB
