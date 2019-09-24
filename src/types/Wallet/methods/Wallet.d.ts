import {Mnemonic,PrivateKey, HDPublicKey, Strategy, Network, Plugins} from "../../types";
import {Account} from "../../Account/Account";

export declare class Wallet {
    constructor(options?: Wallet.Options);

    createAccount(accOptions: Account.Options): Account;
    disconnect(): void;
    exportWallet():Mnemonic["toString"];
    fromMnemonic(mnemonic: Mnemonic):void;
    fromPrivateKey(privateKey: PrivateKey):void;
    fromHDPubKey(HDExtPublicKey:HDPublicKey):void;
    fromSeed(seed:string):void;
    generateNewWalletId():void;
    getAccount(accOptions?: Wallet.getAccOptions): Account;
    updateNetwork(network:Network):boolean;

}
export declare namespace Wallet {
    interface Options {
        offlineMode?: boolean;
        network?: Network;
        plugins?: [Plugins];
        passphrase?: string;
        injectDefaultPlugins?: boolean;
        mnemonic?: Mnemonic
        seed?: Mnemonic
    }
    interface getAccOptions extends Account.Options{
        index?:number;
    }
}

