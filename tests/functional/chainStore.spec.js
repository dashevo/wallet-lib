const { expect } = require('chai');
const { ChainStore } = require('../../src');
const { BlockHeader,Transaction } = require("@dashevo/dashcore-lib");

let testnetChainStore;
const testnetBlockHeadersFixtures = require('../../fixtures/chains/testnet/blockheaders.json');
const testnetTransactionsFixtures = require('../../fixtures/chains/testnet/transactions.json');

describe('ChainStore - Functional', ()=>{
    describe('simple usage', ()=>{
        it('should create a testnet chain store', function () {
            testnetChainStore = new ChainStore('testnet');
            expect(testnetChainStore.network).to.equal('testnet')
        });
        it('should have a initial state', function () {
            expect(testnetChainStore.state.blockHeight).to.equal(0);
            expect(testnetChainStore.state.fees).to.deep.equal({
                minRelay: -1
            });
        });
        it('should allow to import a blockHeaders', function () {
            const stringifiedBlockHeader = testnetBlockHeadersFixtures[0].blockheader;
            const blockHeader = new BlockHeader(Buffer.from(stringifiedBlockHeader, 'hex'));
            testnetChainStore.importBlockHeader(blockHeader)
            expect(testnetChainStore.getBlockHeader(blockHeader.hash).toString()).to.equal(stringifiedBlockHeader)
        });
        it('should allow to watch for an address state', function () {
            testnetChainStore.importAddress('yVSuCVTGpViqV8bzG3kdtofkPhSRWH8dbq');
            const expectedGetAddress = {
                "address": "yVSuCVTGpViqV8bzG3kdtofkPhSRWH8dbq",
                "balanceSat": 0,
                "transactions": [],
                "unconfirmedBalanceSat": 0,
                "utxos": {}
            }
            expect(testnetChainStore.getAddress('yVSuCVTGpViqV8bzG3kdtofkPhSRWH8dbq')).to.deep.equal(expectedGetAddress)
        });
        it('should allow to import a transaction with metadata', function () {
            const { blockHash, height, isInstantLocked, isChainLocked } = testnetTransactionsFixtures[0]
            const stringifiedTransaction = testnetTransactionsFixtures[0].transaction;
            const metadata = {
                blockHash,
                height,
                isInstantLocked,
                isChainLocked
            }
            const transaction = new Transaction(Buffer.from(stringifiedTransaction, 'hex'));
            testnetChainStore.importTransaction(transaction, metadata)
            expect(testnetChainStore.getTransaction(transaction.hash).transaction.toString()).to.equal(stringifiedTransaction)
            expect(testnetChainStore.getTransaction(transaction.hash).metadata).to.deep.equal({
                blockHash,
                height,
                isInstantLocked,
                isChainLocked
            })
        });
        it('should have update address state', function () {
            const expectedGetAddress = {
                "address": "yVSuCVTGpViqV8bzG3kdtofkPhSRWH8dbq",
                "balanceSat": 114820000,
                "transactions": [
                    "7a3c3401462d5dc116db799edb768a2cc0c5e8c05c5483f052b6cab08367a353",
                ],
                "unconfirmedBalanceSat": 0,
                "utxos": {
                    "7a3c3401462d5dc116db799edb768a2cc0c5e8c05c5483f052b6cab08367a353-0": {
                        "satoshis": 114820000,
                        "script": "76a91464220a1c12690ec26d837b3be0a2e3588bb4b79188ac"
                    }
                }
            }
            expect(testnetChainStore.getAddress('yVSuCVTGpViqV8bzG3kdtofkPhSRWH8dbq')).to.deep.equal(expectedGetAddress)
        });
        it('should allow to import a transaction without metadata', function () {
            const stringifiedTransaction = testnetTransactionsFixtures[1].transaction;
            const transaction = new Transaction(Buffer.from(stringifiedTransaction, 'hex'));
            testnetChainStore.importTransaction(transaction)
            expect(testnetChainStore.getTransaction(transaction.hash).transaction.toString()).to.equal(stringifiedTransaction)
            expect(testnetChainStore.getTransaction(transaction.hash).metadata).to.deep.equal({
                blockHash: null,
                height: null,
                isInstantLocked: null,
                isChainLocked: null
            })
        });
        it('should have update address state', function () {
            const expectedGetAddress = {
                "address": "yVSuCVTGpViqV8bzG3kdtofkPhSRWH8dbq",
                "balanceSat": 214890000,
                "transactions": [
                    "7a3c3401462d5dc116db799edb768a2cc0c5e8c05c5483f052b6cab08367a353",
                    "61e5a9ffbf505ad9e5b0a715673ec3c89d68dc9b1d1af8fd980240b8ac14c29c"
                ],
                "unconfirmedBalanceSat": 0,
                "utxos": {
                    "61e5a9ffbf505ad9e5b0a715673ec3c89d68dc9b1d1af8fd980240b8ac14c29c-0": {
                            "satoshis": 100070000,
                             "script": "76a91464220a1c12690ec26d837b3be0a2e3588bb4b79188ac"
                    },
                   "7a3c3401462d5dc116db799edb768a2cc0c5e8c05c5483f052b6cab08367a353-0": {
                       "satoshis": 114820000,
                       "script": "76a91464220a1c12690ec26d837b3be0a2e3588bb4b79188ac"
                   }
                }
            }
            expect(testnetChainStore.getAddress('yVSuCVTGpViqV8bzG3kdtofkPhSRWH8dbq')).to.deep.equal(expectedGetAddress)
        });
        it('should update a transaction', function () {
            const stringifiedTransaction = testnetTransactionsFixtures[1].transaction;
            const transaction = new Transaction(Buffer.from(stringifiedTransaction, 'hex'));
            testnetChainStore.importTransaction(transaction, {
                blockHash: '0000005c81a683007e86e75c76b4b2feca229f806702ca92953562f2ae628ce7',
                height: 618023,
                isInstantLocked: true,
                isChainLocked: true
            })
            expect(testnetChainStore.getTransaction(transaction.hash).transaction.toString()).to.equal(stringifiedTransaction)
            expect(testnetChainStore.getTransaction(transaction.hash).metadata).to.deep.equal({
                blockHash: '0000005c81a683007e86e75c76b4b2feca229f806702ca92953562f2ae628ce7',
                height: 618023,
                isInstantLocked: true,
                isChainLocked: true
            })
        });
        // it('should also have updated watched address', function () {
        //
        // });
        // it('should allow to import an instantLock for a transaction', function () {
        //    
        // });
        // it('should have updated address state with locks', function () {
        //
        // });
        let exportedState;
        it('should allow to export', function () {
            exportedState = testnetChainStore.exportState()
        });
        it('should allow to import store', function () {
            const importedChainStore = new ChainStore();
            importedChainStore.importState(exportedState)
            expect(importedChainStore.exportState()).to.deep.equal(exportedState)
        });
        it('should consider previous transaction when address is added afterwards', function () {
            const importedChainStore = new ChainStore();
            const modifiedState = JSON.parse(JSON.stringify(exportedState));
            modifiedState.state.addresses = {};
            importedChainStore.importState(modifiedState)
            importedChainStore.importAddress("yVSuCVTGpViqV8bzG3kdtofkPhSRWH8dbq")
            expect(importedChainStore.exportState()).to.deep.equal(exportedState)
        });
    })
});

