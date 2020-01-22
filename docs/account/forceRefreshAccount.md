**Usage**: `account.forceRefreshAccount()`    
**Description**: Force a refresh of all the addresses informations (utxo, balance, txs...) by invalidating previous.   
**Important**: This is used for experience developer. If you have an issue or need using it, please do not hesitate to post an issue on GitHub.   

Parameters: 

| parameters        | type   | required       | Description                                      |  
|-------------------|--------|----------------| -------------------------------------------------|
| **method**        | String | yes            | Enter a valid encryption method (one of: ['aes'])|
| **data**          | String | yes            | The value to encrypt                             |
| **secret**        | String | yes            | The secret used in order to encrypt the data     |

Returns : encrypted value (string).   

```js
const encrypted = account.encrypt('aes','coucou', 'secret');
console.log(encrypted);// U2FsdGVkX18+7ixRbZ7DzC8P8X/4ewNHSp2R6pZDmsI=
