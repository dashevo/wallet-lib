
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
