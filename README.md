# Dash Wallet Library

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

Transports :

- [ ] DAPI-Client
- [ ] Dash-P2P

Adapters (help from community welcomed) :

- [ ] LocalStorage
- [ ] SecureStorage
- [ ] LevelDB
- [ ] MongoDB
- [ ] BerkeleyDB
- [ ] LowDB
