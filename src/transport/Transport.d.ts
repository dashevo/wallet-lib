import {Block, BlockHeader, Transaction} from "@dashevo/dashcore-lib";
import GetIdentityIdsByPublicKeyHashesResponse from '@dashevo/dapi-client/lib/methods/platform/getIdentityIdsByPublicKeyHashes/GetIdentityIdsByPublicKeyHashesResponse';

export declare interface Transport {
    announce(eventName, args)

    disconnect()

    getBestBlock(): Promise<Block>

    getBestBlockHash(): Promise<string>

    getBestBlockHeader(): Promise<BlockHeader>

    getBestBlockHeight(): Promise<number>

    getBlockByHash(hash): Promise<Block>

    getBlockByHeight(height): Promise<Block>

    getBlockHeaderByHash(hash): Promise<BlockHeader>

    getBlockHeaderByHeight(height): Promise<BlockHeader>

    getIdentityIdsByPublicKeyHash(publicKeyHashes: Buffer[]): Promise<GetIdentityIdsByPublicKeyHashesResponse>

    getStatus(): Promise<object>

    getTransaction(txid): Promise<Transaction>

    sendTransaction(serializedTransaction): Promise<string>

    subscribeToAddressesTransactions()

    subscribeToBlockHeaders()

    subscribeToBlocks()
}
