**Usage**: `new Account(wallet, accountOpts)`  
**Description**: This method create a new Account associated to the given wallet.   
**Notes**: As it is directly linked to a wallet, you might want to rely on `Wallet.getAccount(index)` instead.   
When `wallet.offlineMode:true`, you can manage utxos / addresses by the cache options (or after init via the Storage controller).

Parameters: 

- accountOpts : 

| parameters                    | type            | required       | Description                                                                                                                                                                    |  
|-------------------------------|-----------------|----------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **index**                     | number          | no             | The BIP44 account index, by default use the next one (n+1) of the biggest account index already created in wallet                                                              |
| **strategy**                  | string/function | no             | A valid strategy string identifier (amongst "simpleAscendingAccumulator", "simpleDescendingAccumulator", simpleTransactionOptimizedAccumulator") or your own strategy function |
| **label**                     | string          | no (def: null) | If you want to be able to reference to an account per label |
| **injectDefaultPlugins**      | boolean         | no (def: true) | Use to inject default plugins on loadup (BIP44Worker, ChainWorker and SyncWorker) |
| **allowSensitiveOperations**  | boolean         | no (def: false)| If you want a special plugin to access the keychain or other sensitive operation, set this to true. |
| **cacheTx**                   | boolean         | no (def: true) | If you want to cache the transaction internally (for faster sync-up) |
| **cache.addresses**           | object          | no             | If you have your addresses state somewhere else (fs) you can fetch and pass it along for faster sync-up |
| **cache.transactions**        | object          | no             | If you have your tx state somewhere else (fs) you can fetch and pass it along for faster sync-up |

Returns : Account instance.

Examples (assuming a Wallet instance created) : 

```js
const { Account } = require('@dashevo/wallet-lib')
const account = new Account(wallet, {index: 42});
```
