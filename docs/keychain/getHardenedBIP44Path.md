**Usage**: `keychain.getHardenedBIP44Path(index,type)`    
**Description**: Return a safier root path to derivate from

Parameters: 

| parameters        | type        | required                  | Description                                                                                             |  
|-------------------|-------------|---------------------------| -------------------------------------------------|
| **type**          | string      | no (default:HDPrivateKey) | Enter a valid type (one of: ['HDPrivateKey','HDPublicKey']) |

Returns : HDPrivateKey

Example: 
```js
const { privateKey } = keychain.getKeyForChild(0);
```


VERIFY THAT IT ACTUALLY WORKS AS EXPECTED LOL.
