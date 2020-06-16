import {Mnemonic, PrivateKey, HDPublicKey, Strategy, Network, Plugins, AddressInfoMap, WalletType} from "../types";
import {Account} from "../Account/Account";
import {Storage} from "../Storage/Storage";
import {HDPrivateKey} from "@dashevo/dashcore-lib";
import {Transporter} from "../../transporters/Transporter";

export declare class Wallet {
    offlineMode: boolean;
    allowSensitiveOperations: boolean;
    injectDefaultPlugins: boolean;
    plugins:[Plugins];
    passphrase:string;
    transporter: Transporter;
    network: Network;
    walletId: string;
    accounts: [];
    storage: Storage;
    store: Storage.store;

    constructor(defaultWalletOptions?: Wallet.IWalletOptions);
    createAccount(accOptions: Account.Options): Promise<Account>;
    disconnect(): void;
    exportWallet():Mnemonic["toString"];
    fromHDPrivateKey(privateKey: HDPrivateKey):void;
    fromHDPublicKey(HDPublicKey:HDPublicKey):void;
    fromMnemonic(mnemonic: Mnemonic):void;
    fromPrivateKey(privateKey: PrivateKey):void;
    fromSeed(seed:string):void;
    generateNewWalletId():string;
    getAccount(accOptions?: Account.Options): Promise<Account>;
    sweepWallet(): Promise<Account>
}

export declare namespace Wallet {
     // @ts-ignore
    const defaultWalletOptions: Wallet.IWalletOptions = {
        debug: false,
        offlineMode: false,
        network: 'testnet',
        plugins: [],
        passphrase: null,
        transporter: undefined,
        injectDefaultPlugins: true,
        allowSensitiveOperations: false,
    };
    interface IWalletOptions {
        offlineMode?: boolean;
        debug?: boolean;
        transporter?: string|object|any;
        network?: Network;
        plugins?: undefined[]|[Plugins];
        passphrase?: string;
        injectDefaultPlugins?: boolean;
        allowSensitiveOperations?: boolean;
        mnemonic?: Mnemonic|string|null;
        seed?: Mnemonic|string;
        privateKey?: PrivateKey|string;
        HDPrivateKey?: HDPrivateKey|string;
        HDPublicKey?: HDPublicKey|string;
    }
}
