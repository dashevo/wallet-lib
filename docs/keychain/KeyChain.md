**Usage**: `new KeyChain(opts)`  
**Description**: This method create a new KeyChain. Which handle handle the derivation and handling of the HDRootKey (when init from an HDPrivKey).  

While both the seed and the mnemonic would allow to generate other coins private keys, a HDRootKey is specific to a coin, which is why it's the value used in store..    

Parameters: 

- opts : 

| parameters                    | type            | required       | Description                                                                                                                                                                    |  
|-------------------------------|-----------------|----------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **network**                   | Network|String  | no (testnet)   | The network to use for the KeyChain address derivation                                                          |
| **type**                      | string          | yes            | The type of the KeyChain (HDPrivateKey, HDPublicKey or privateKey) |
| **HDPrivateKey**              | object          | yes (if type)  | If type is HDPrivateKey, the root HDPrivateKey to allow KeyChain to generate new address |
| **HDPublicKey**               | object          | yes (if type)  | If type is HDPublicKey, the root HDPublicKey to allow KeyChain to generate new public address |
| **PrivateKey**                | object          | yes (if type)  | If type is a PrivateKey, the PrivKey to allow KeyChain to manage public address |
| **keys**                      | object          | no             | If required, allow to create KeyChain by passing it a set of keys  |

Returns : Keychain instance.

