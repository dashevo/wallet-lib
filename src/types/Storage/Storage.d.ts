import {
    AddressInfo,
    AddressObj,
    AddressType,
    Mnemonic,
    Network,
    SerializedUTXO,
    TransactionInfo,
    WalletObj, WalletType
} from "../types";
import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import {BlockHeader} from "@dashevo/dashcore-lib";
import {CONSTANTS, Wallet} from "../..";

export declare namespace Storage {
    interface IStorageOptions {
        rehydrate?: boolean;
        autosave?: boolean;
        autosaveIntervalTime?: number;
        network?: Network;
    }
    const defaultStorageOptions: Storage.IStorageOptions = {
        rehydrate: true,
        autosave: true,
        autosaveIntervalTime: CONSTANTS.STORAGE.autosaveIntervalTime,
        network: 'testnet',
    };
    interface store {
        wallets: {},
        transactions: {},
        chains: {},
    }
}


export declare class Storage {
    constructor(options?: Storage.IStorageOptions = Storage.defaultStorageOptions);
    store: {};
    rehydrate: boolean;
    autosave: boolean;
    autosaveIntervalTime: number;
    lastRehydrate: number|null;
    lastSave: number|null;
    lastModified: number|null;
    network: Network;
    mappedAddress: MappedAddressMap;

    addNewTxToAddress(tx: TransactionInfo, address: string): boolean;
    announce(type: string, el: any): boolean;
    calculateDuffBalance(walletId: number, accountId: number, type: string): number;
    clearAll(): boolean;
    configure(opts: {
        rehydrate?: boolean,
        autosave?: boolean,
        adapter?: any
    }): void;
    createChain(network: string): boolean;
    createWallet(walletId: string, network: Network, mnemonic?:Mnemonic, type?: WalletType ): boolean;
    getStore(): any;
    getBlockHeader(): any;
    getTransaction(txid: string): TransactionInfo;
    importAccounts(accounts: any, walletId: string): boolean;
    importAddress(address: AddressObj): boolean;
    importAddresses(addresses: [AddressObj]): boolean;
    importBlockHeader(): any;
    importSingleAddress(singleAddress: AddressObj): boolean;
    importTransaction(transaction: TransactionInfo): boolean;
    importTransactions(transactions: [TransactionInfo]): boolean;
    rehydrateState(): void;
    saveState(): boolean;
    searchAddress(address: string, forceLoop: boolean): AddressSearchResult;
    searchAddressesWithTx(txid: number): AddressesSearchResult;
    searchBlockHeader(identifier: string|number): BlockHeaderSearchResult;
    searchTransaction(txid: number): TransactionSearchResult;
    searchWallet(walletId: number): WalletSearchResult;
    updateAddress(addressObj: AddressObj, walletId: number): boolean;
    updateTransaction(transaction: TransactionInfo): boolean;
    startWorker(): void;
    stopWorker(): boolean;

    insertIdentityIdAtIndex(walletId: string, identityId: string, identityIndex: number): void;
    getIdentityIdByIndex(walletId: string, identityIndex: number): string|undefined;
    getIndexedIdentityIds(walletId: string): Array<string|undefined>;
}

interface MappedAddressMap {
    [pathName: string]: MappedAddress
}

interface MappedAddress {
    [path: string]: {
        walletId: string,
        type: AddressType,
        path: string
    };
}

interface WalletSearchResult {
    walletId: number,
    found: boolean,
    result?: WalletObj
}

interface TransactionSearchResult {
    txid: number,
    found: boolean,
    result?: TransactionInfo
}

interface AddressSearchResult {
    address: string,
    type: AddressType,
    found: boolean,
    path?: string,
    result: AddressObj,
    walletId: number
}
interface BlockHeaderSearchResult {
    found: boolean,
    result: BlockHeader,
    identifier: number|string
}

interface AddressesSearchResult {
    txid: number,
    found: boolean,
    results: [AddressObj]
}
