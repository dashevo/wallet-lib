**Usage**: `account.getUTXOS(onyAvailable)`      
**Description**: This method will return the list of all available UTXOS for this account.

Parameters: 

| parameters           | type      | required       | Description                                                                       |  
|----------------------|-----------|----------------| -------------------------------------------------------------------------------	  |
| **onlySpendable**    | boolean   | no (def: true) | When set at true, returns only the UTXOS that are spendable |

Returns : Array[utxos].
