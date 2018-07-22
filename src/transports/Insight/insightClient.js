const axios = require('axios');

// Here to avoid asking to much to the network when doing a nodemon for the tests.
// Probably will require to mock the test part.
const fakeReq = {
  addr: {},
  utxos: {},
};

/**
 * Temporary class to perform request on insight instead of DAPI
 */
class InsightClient {
  constructor() {
    this.type = this.constructor.name;
    this.uri = 'https://testnet-insight.dashevo.org/insight-api-dash/';
    // this.uri = 'http://localhost:3001/insight-api/';
  }

  async getAddressSummary(address) {
    if (!fakeReq.addr[address]) {
      const res = await axios.get(`${this.uri}/addr/${address}`);
      fakeReq.addr[address] = res.data;
    }
    return fakeReq.addr[address];// throw new Error(address);
  }

  async getUTXO(address) {
    if (!fakeReq.utxos[address]) {
      const res = await axios.get(`${this.uri}/addr/${address}/utxo`);
      fakeReq.utxos[address] = res.data;
    }
    return fakeReq.utxos[address];// throw new Error(address);
  }

  async sendRawTransaction(rawTx, isIs = false) {
    const url = (isIs) ? `${this.uri}tx/sendix` : `${this.uri}tx/send`;
    return axios
      .post(url, { rawTx })
      .then(res => res.data).catch((err) => {
        throw new Error(err);
      });
  }
  // sendRawTransaction: async (rawtx, isIx = false) => {
  //   const url = (isIx) ? `${uri}tx/sendix` : `${uri}tx/send`;
  //   return axios
  //     .post(url, { rawtx })
  //     .then(res => res.data).catch((err) => {
  //       throw new Error(err);
  //     });
  // },
  // }
}
module.exports = InsightClient;
