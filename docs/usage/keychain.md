## Keychain

This class handle the derivation and handling of the HDRootKey.  

The reason we keep the HDRootKey is because both the seed and the mnemonic would allow to generate other coins private keys, while a HDRootKey is specific to a coin. 

See below on how to generate keychain from seed or mnemonic.    

### Create a Keychain

```
const keychain = new KeyChain(hdRootKey);
```

### Get keys for a specific path

```
const path = `m/44'/1'/0'/0/0`;
const {PrivateKey, PublicKey} = keychain.getKeyForPath(path);
```

### Generate Key For Path

The `getKeyForPath` method will handle it's own cache, therefore getKeyForPath might be returned from the cache.
If you really want to derivate, no matter of anything, this is the method to use.

```
const path = `m/44'/1'/0'/0/0`;
const {PrivateKey, PublicKey} = keychain.generateKeyForPath(path);
```

This method will not update the keychain cache.

### Create a keychain from mnemonic 

```js
const {utils} = require('@dashevo/wallet-lib');
const keychain = new KeyChain({ HDPrivateKey: utils.mnemonicToHDPrivateKey(mnemonic, 'testnet') });
```

### Create a keychain from seed 

```js
const {utils} = require('@dashevo/wallet-lib');
const keychain = new KeyChain({ HDPrivateKey: utils.seedToHDPrivateKey(seed, 'testnet') });
```
