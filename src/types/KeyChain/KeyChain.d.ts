import {PrivateKey, Network,} from "../types";
import {HDPrivateKey, HDPublicKey} from "@dashevo/dashcore-lib";
import {Transaction} from "@dashevo/dashcore-lib/typings/transaction/Transaction";

export declare class KeyChain {
    constructor(options?: KeyChain.Options);
    network: Network;
    keys: [Keys];

    // todo valid keychain type object.
    type: string;
    HDPrivateKey?: HDPrivateKey;
    privateKey?: PrivateKey;


    generateKeyForChild(index: number, type?: HDKeyTypesParam): HDPrivateKey|HDPublicKey;
    generateKeyForPath(path: string, type?: HDKeyTypesParam): HDKeyTypes;

    getHardenedBIP44Path(type?: HDKeyTypesParam): HDKeyTypes;
    getHardenedDIP9FeaturePath(type?: HDKeyTypesParam): HDKeyTypes;

    getKeyForChild(index: number, type?: HDKeyTypesParam): HDKeyTypes;
    getKeyForPath(path: string, type?: HDKeyTypesParam): HDKeyTypes;
    getPrivateKey(): HDPrivateKey|PrivateKey;

    sign(object: Transaction, privateKeys:[any], sigType: number): any;

}
type HDKeyTypes = HDPublicKey | HDPrivateKey;

export declare enum HDKeyTypesParam {
    HDPrivateKey="HDPrivateKey",
    HDPublicKey="HDPrivateKey",
}
export declare interface Keys {
    [path: string]: {
        path: string
    };
}
export declare namespace KeyChain {
    interface Options {
        network?: Network;
        keys?: [Keys]
    }
}


