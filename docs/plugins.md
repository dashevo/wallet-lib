## Plugins

The Wallet-Library is able to handle plugins. 
There are particular structured code that can perform action on your wallet.

By default, two plugins are injected : BIP44Worker, and SyncWorker. 
You can disable them by adding `injectDefaultPlugins:false` at the initialization parameter of your wallet object.
 
For more granularity, you could do it as a parameter of `getAccount(accId, accOpts)`.

### Type of plugins 

There is different type of plugins that can be used in the wallet-library : 

- Workers : A worker plugins is a plugin that inherits from Worker class. It distinguish itself by having a init, startWorker, execWorker and stopWorker methods.
Except if clearly asked
- DAP :  A DAP plugins inherits from DAP class and is only require to have a init method. 
- Standard : These are mostly enhancers of the wallet library functionalities.
  
### Dependencies

In order for a plugin to have the ability to access the data, you have to explicitely 
notice about it in the constructor. 

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

Will allow to access the walletId property, same thing is doable with account function. 