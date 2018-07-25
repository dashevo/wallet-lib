# Wallet Library
=====================

[![NPM Package](https://img.shields.io/npm/v/@dashevo/wallet-lib.svg?style=flat-square)](https://www.npmjs.org/package/@dashevo/wallet--lib)
[![Build Status](https://img.shields.io/travis/dashevo/wallet-lib.svg?branch=master&style=flat-square)](https://travis-ci.org/dashevo/wallet-lib)
[![Coverage Status](https://img.shields.io/coveralls/dashevo/wallet-lib.svg?style=flat-square)](https://coveralls.io/github/dashevo/wallet-lib?branch=master)

A pure and powerful Wallet Library for Dash - Layer 1

See also : Layer 2 DAP-SDK
## Principles

Dash is a powerful new peer-to-peer platform for the next generation of financial technology. The decentralized nature of the Dash network allows for highly resilient Dash infrastructure, and the developer community needs reliable, open-source tools to implement Dash apps and services.

## Usage


## Features

BIPS Supports :

- [ ] BIP32 (Hierarchical Deterministic Wallets)
- [ ] BIP38 (Passphrase protected private key)
- [ ] BIP39 (Mnemonic code for generating deterministic keys)
- [ ] BIP43 (Purpose field for deterministic wallets)
- [ ] BIP44 (Multi-Account Hierarchy for Deterministic Wallets)

DIPS Supports :

- [ ] DIP2 (Special Transactions
- [ ] DIP3 (Deterministic Masternode List
- [ ] DIP4 (Simplified Verification of MN list)

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
- [ ] Discovery : Discover existing account
- [ ] Discovery : Discover existing address / change
- [ ] Transaction : Create transaction (rawtx)
- [ ] Transaction : Broadcast transaction
- [ ] Transaction : History fetching / Balance
- [ ] Transaction : InstantSend
- [ ] UTXO Optimisation / Control
- [ ] Fee estimation
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
