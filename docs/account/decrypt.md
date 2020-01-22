**Usage**: `account.decrypt(encodedValue)`    
**Description**: Allow to decrypt an encrypted message

Parameters: 

| parameters        | type   | required       | Description                                                                                             |  
|-------------------|--------|----------------| -------------------------------------------------|
| **method**        | String | yes            | Enter a valid decrypt method (one of: ['aes']) |
| **data**          | String | yes            | An encrypted value                                  |
| **secret**        | String | yes            | The secret used for encrypting the data in first place     |

Returns : decoded value (string).

```js
const decrypted = account.decrypt('aes','U2FsdGVkX18+7ixRbZ7DzC8P8X/4ewNHSp2R6pZDmsI=', 'secret')
console.log(decrypted);// coucou
```
