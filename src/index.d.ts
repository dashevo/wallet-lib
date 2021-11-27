/// <reference path="types/types.d.ts" />
/// <reference path="types/Account/Account.d.ts" />
/// <reference path="types/Wallet/Wallet.d.ts" />
import { Account } from "./types/Account/Account";
import { Wallet } from "./types/Wallet/Wallet";
import { Identities } from "./types/Identities/Identities";
import { IdentitiesStore } from "./types/IdentitiesStore/IdentitiesStore";
import { KeyChain } from "./types/KeyChain/KeyChain";
import { KeyChainStore } from "./types/KeyChainStore/KeyChainStore";
import { Storage } from "./types/Storage/Storage";
import { ChainStore } from "./types/ChainStore/ChainStore";
import CONSTANTS from "./CONSTANTS";
import EVENTS from "./EVENTS";
import utils from "./utils";
import plugins from "./plugins";

export {
    Account,
    Wallet,
    ChainStore,
    KeyChain,
    KeyChainStore,
    Identities,
    IdentitiesStore,
    EVENTS,
    CONSTANTS,
    utils,
    plugins,
};
declare module '@dashevo/wallet-lib';
