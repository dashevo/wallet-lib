**Usage**: `account.broadcastTransaction(transaction)`      
**Description**: Allow to broadcast a valid **signed** transaction to the network.  
**Notes**: Use [`account.sign(transaction)`](/account/sign) to have sign the transaction first.  

Parameters: 

| parameters             | type               | required       | Description                                                                                             |  
|------------------------|--------------------|----------------| ------------------------------------------------------------------------------------------------ |
| **transaction**        | Transaction/String | yes            | A valid [created transaction](/account/createTransaction) or it's hexadecimal raw representation |

Returns : transactionId (string).

N.B : The TransactionID provided is [malleable](https://dashcore.readme.io/docs/core-guide-transactions-transaction-malleability), and is not a source of truth (the transaction might be included in a block with a different txid).
