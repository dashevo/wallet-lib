## Account

In Wallet-Lib, an Account represent in an ideal condition (HDWallet) a specific BIP44 path instance (in case of a singleAddress - fromPrivateKey, the concept of multiple account vanish).
This Account hold all the method that one might want to use, from creating a transaction to getting the transaction history. 

## Create an Account

```
const account = wallet.createAccount([opts]);
const account = new Account(wallet, [opts]);
```

##### options

> **cacheTx** : Bool(def: true) : Allow to disable all transaction caching

> **allowSensitiveOperations** : Bool(def: false) : When set at true, allow plugins to access storage or sensible information. 

> **injectDefaultPlugins** : Bool(def: true) : When set at false, disable default plugins (SyncWorker, ChainWorker, BIP44Worker)

> **accountIndex** : Num(def: accounts.length) : Allow to specify which index you wish to create

> **label** : String : Allow to attach a label to an Account (Savings,...)

> **network** : String(def: testnet) : Will be used to set the network for various crypto manipulation (genAddr)

> **plugins** : Array(def: []) : Allow to pass specific plugins to a wallet (see Plugins documentation).

> **cache** : Allow to pass a cache object (for manual import of state)

> **cache.addresses** Array|Object 

> **cache.transactions** Array|Object 

---
### Broadcast Transaction Balance

`const txid = await account.broadcastTransaction(rawtx)`

##### params

> **rawtx** : The hexadecimal reprensation of a transaction.

---

### Get Addresses

Will return all the addresses currently watched / known, in case of a HD44, it return all used address + 20 unused.

```
const addresses = account.getAddresses();
const internalAddresses = account.getAddresses('internal');
```
##### params

> **type** : Enum[external, internal, misc] (default:external) :  Return the specified type addresses

---

### Get Unused Address

`const address = account.getUnusedAddress()`

##### params

> **type** : Enum[external, internal, misc] (default:external) :  Return the specified type addresses

> **skip** : Num (default:0)

---

### Get Balance

Will return the balance amount in satoshis,

`const balance = account.getBalance()`

##### params

> **unconfirmed** : Boolean (default:true) :  Return the balance including unconfirmed inbound tx

> **displayDuffs** : Boolean (default:true) : When set at true return in Duffs, else what in Dash.

---


### Create Transaction

The transaction creation method output a hexadecimal representation of a transaction, also called rawtx.   
Using Dashcore-lib.Transaction class you can inspect the rawtx or control inputs/outputs/fees.   
To broadcast a transaction, used the `broadcastTransaction()` method.


`const rawtx = account.createTransaction(opts)`

##### opts

> **amount** : Num - Amount in dash that you want to send

> **satoshis** : Num - Amount in satoshis

> **recipient** : Address - Address of the recipient

> **change** : Address(def: First internal unused) - Address where remaining will be sent

> **isInstantSend** : Bool (def:false) -- If you want to use IS or stdTx.

> **deductFee** : Bool (def: True) - Specify if you want to deduct fee from the coinSelection process

> **privateKeys** : Array[PrivateKey] : Will overwrite the behavior of autosearching for keys and sign using those instead.

---

### Create Transaction From UTXOS

`const rawtx = account.createTransactionFromUTXOS(opts)`

Similar than standard one with the exception of an expected passed utxos list instead of searching locally.

> **opts.utxos** : Array[utxos] - UTXOS from where spend. Allow granular control.

---


### Get Transaction

```
const tx = account.getTransaction(${txid});
```

##### params

> **txid** : TxId : Allow to get a transaction by it's txid

---

### Get Transaction history

```
const txHistory = account.getTransactionHistory();
```

---

### Get UTXO

`const utxos = account.getUTXOS()`

##### params

> **onlyAvailable** : Boolean (def : true) : When set at true, only return the UTXOS avaliable (6+ conf)

---

### Get Private Keys

`const privateKeys = account.getPrivateKeys(addressList)`

##### params

> **addressList** : Array[String] - required

---

### Sign

`const signedTransaction = account.sign(transaction, privatekeys, sigtype)`

---

### Disconnect

```
account.disconnect();
```
