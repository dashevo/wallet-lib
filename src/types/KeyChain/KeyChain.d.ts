import {PrivateKey, Network,} from "../types";
import {HDPrivateKey} from "@dashevo/dashcore-lib";

export declare class KeyChain {
    constructor(options?: KeyChain.Options);
    network: Network;
    keys: [Keys];

    // todo valid keychain type object.
    type: string;
    HDPrivateKey?: HDPrivateKey;
    privateKey?: PrivateKey;


    generateKeyForChild(index: number, type: HDKeyTypesParam): HDKeyTypes;
    generateKeyForPath(path: string, type: HDKeyTypesParam): HDKeyTypes;

    getHardenedBIP44Path(): string;
    getHardenedDIP9FeaturePath(): string;

    getKeyForChild(index: number, type: HDKeyTypesParam): HDKeyTypes;
    getKeyForPath(path: string, type: HDKeyTypesParam): HDKeyTypes;
    getPrivateKey(): HDPrivateKey|PrivateKey;

    // TODO : dashcore-lib miss an implementation definition of crypto.Signature
    sign(object: any, privateKeys:[any], sigType: object): any;

}
export declare enum HDKeyTypes {
    HDPrivateKey,
    HDPublicKey,
}
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


