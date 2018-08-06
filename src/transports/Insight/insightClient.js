const axios = require('axios');
const io = require('socket.io-client');
// Here to avoid asking to much to the network when doing a nodemon for the tests.
// Probably will require to mock the test part.
const fakeReq = {
  addr: {},
  utxos: {},
  transaction: {},
};
const defaultOpts = {
  uri: 'https://testnet-insight.dashevo.org/insight-api-dash',
  socketUri: 'https://testnet-insight.dashevo.org/',
  useSocket: true,
};
/**
 * Temporary class to perform request on insight instead of DAPI
 */
class InsightClient {
  constructor(opts = defaultOpts) {
    this.type = this.constructor.name;
    this.uri = (opts.uri) ? opts.uri : defaultOpts.uri;
    this.socketUri = (opts.socketUri)
      ? opts.socketUri
      : defaultOpts.socketUri;
    this.useSocket = (opts.useSocket === null) ? defaultOpts.useSocket : opts.useSocket;

    if (this.useSocket) {
      this.socket = io(this.socketUri, { transports: ['websocket'] });
      this.socket.emit('subscribe', 'inv');
      this.socket.on('connect', () => console.log('Socket connected!'));
      this.socket.on('block', block => console.log('block', block));
      this.socket.on('tx', tx => console.log('tx', tx));
      this.socket.on('txlock', txlock => console.log('txlock', txlock));
      this.socket.on('event', event => console.log('event', event));
      this.socket.on('disconnect', disconnect => console.log('disconnect', disconnect));
      this.socket.on('error', error => console.log('error', error));
    }
  }

  closeSocket() {
    if (this.useSocket) {
      this.socket.close();
    }
  }

  async getAddressSummary(address) {
    if (!fakeReq.addr[address]) {
      const res = await axios.get(`${this.uri}/addr/${address}`);
      fakeReq.addr[address] = res.data;
    }
    return fakeReq.addr[address];// throw new Error(address);
  }

  async getTransaction(transaction) {
    if (!fakeReq.transaction[transaction]) {
      const res = await axios.get(`${this.uri}/tx/${transaction}`);
      fakeReq.transaction[transaction] = res.data;
    }
    return fakeReq.transaction[transaction];// throw new Error(address);
  }

  async getUTXO(address) {
    if (!fakeReq.utxos[address]) {
      const res = await axios.get(`${this.uri}/addr/${address}/utxo`);
      fakeReq.utxos[address] = res.data;
    }
    return fakeReq.utxos[address];// throw new Error(address);
  }

  async sendRawTransaction(rawtx, isIs = false) {
    const url = (isIs) ? `${this.uri}/tx/sendix` : `${this.uri}/tx/send`;
    return axios
      .post(url, { rawtx })
      .then(res => res.data)
      .catch((err) => {
        console.log(err);
        throw new Error(err);
      });
  }

  async subscribeToAddress(address, cb) {
    if (this.useSocket) {
      this.socket.emit('subscribe', 'dashd/addresstxid', [address]);
      this.socket.on('dashd/addresstxid', cb);
    }

    return true;
  }
}
module.exports = InsightClient;
