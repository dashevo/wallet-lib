## Plugins

The Wallet-Library is able to handle plugins. 
These are particular structured code that can perform actions on your wallet.

By default, two plugins are injected : BIP44Worker, and SyncWorker. 
You can disable them by adding `injectDefaultPlugins:false` in the initialization parameter of your wallet object.

For more granularity, you could do it as a parameter of `getAccount(accId, accOpts)`.

### Type of plugins 

There are three different types of plugins that can be used in the wallet-library:

- Workers : A worker plugins is a plugin that inherits from Worker class. It distinguishes itself by having init, startWorker, execWorker and stopWorker methods.
- DAP :  A DAP plugin inherits from the DAP class and is only required to have a init method. 
- Standard : These are mostly enhancers of the wallet library functionalities.

### Dependencies

In order for a plugin to have the ability to access wallet data, you have to add a dependency in the constructor.

```
class MyPlugin extends StandardPlugin { 
   constructor(){
    this.dependencies = ['walletId']
   }
   doStruff(){
     return this.walletId.substr(0);
   }
}
```

This will allow to access the walletId property; the same thing is doable with the account function.
