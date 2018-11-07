const { utils, plugins } = require('../../src');
const Dashcore = require('@dashevo/dashcore-lib');

const coinSelection = utils.coinSelection;
const DAP = plugins.DAP;

class DashPayDAP extends DAP {
  constructor(props) {
    super({
      dependencies: [
        'getUTXOS',
        'getBalance',
        'getUnusedAddress',
        'sign',
        'broadcastTransaction',
        'keyChain',
      ],
    });
  }

  /**
   * @param {string} rawRegistration - hex string representing user registration data
   * @param {number} [funding] - default funding for the account in duffs. Optional.
   If left empty,
   * funding will be 0.
   * @return {string} - user id
   */
  async registerUsername(blockchainUsername) {
    const { address } = this.getUnusedAddress();
    const balance = await this.getBalance();

    const utxos = await this.getUTXOS();
    const outputsList = [{ address, satoshis: balance }];
    const inputs = coinSelection(utxos, outputsList, false);

    const privateKey = this.keyChain.getKeyForPath('m/2/0');
    console.log('PrivateKey', privateKey);

    const txOpts = {
      type: Dashcore.Transaction.TYPES.TRANSACTION_SUBTX_REGISTER,
      outputs: outputsList,
    };
    const transaction = new Dashcore.Transaction(txOpts).from(inputs);
    transaction
      .extraPayload
      .setUserName(blockchainUsername)
      .setPubKeyIdFromPrivateKey(privateKey);
    const signedTransaction = this.sign(transaction);
    // await this.broadcastTransaction(signTransaction)
    return signedTransaction;
  }

  async searchUsername(pattern) { throw new Error('Not implemented.'); }

  async topUpUserCredit(userId, amount) { throw new Error('Not implemented.'); }

  async approveContactRequest(blockchainUsername) { throw new Error('Not implemented.'); }

  async denyContactRequest(blockchainUsername) { throw new Error('Not implemented.'); }

  async proposeContact(blockchainUsername) { throw new Error('Not implemented.'); }

  async removeContact(blockchainUsername) { throw new Error('Not implemented.'); }
}

module.exports = DashPayDAP;
