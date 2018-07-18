const axios = require('axios');

// Here to avoid asking to much to the network when doing a nodemon for the tests.
// Probably will require to mock the test part.
const fakeReq = {
  addr: {},
  utxos: {},
};
/**
 * Temporary class to perform request on insight instead of DAPI
 * TODO: If ENV_DEV=1 then use this, else continue
 */
class DAPIClient {
  constructor() {
    const uri = 'https://testnet-insight.dashevo.org/insight-api-dash/';
    // let uri = 'http://localhost:3001/insight-api/';
    this.API = {
      getAddressSummary: async (address) => {
        if (!fakeReq.addr[address]) {
          const res = await axios.get(`${uri}/addr/${address}`);
          fakeReq.addr[address] = res.data;
        }
        return fakeReq.addr[address];// throw new Error(address);
      },
      getUtxos: async (address) => {
        if (!fakeReq.utxos[address]) {
          const res = await axios.get(`${uri}/addr/${address}/utxo`);
          fakeReq.utxos[address] = res.data;
        }
        return fakeReq.utxos[address];// throw new Error(address);
      },
      sendRawTransaction: async (rawtx, isIx = false) => {
        const url = (isIx) ? `${uri}tx/sendix` : `${uri}tx/send`;
        return axios
          .post(url, { rawtx })
          .then(res => res.data).catch((err) => {
            console.error('err', err);
          });
      },
    };
  }
}
module.exports = DAPIClient;
