const axios = require('axios');
const io = require('socket.io-client');
// Here to avoid asking to much to the network when doing a nodemon for the tests.
// Probably will require to mock the test part.

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
    this.listeners = {};
    this.type = this.constructor.name;
    this.uri = (opts.uri) ? opts.uri : defaultOpts.uri;
    this.socketUri = (opts.socketUri)
      ? opts.socketUri
      : defaultOpts.socketUri;
    this.useSocket = (opts.useSocket) ? opts.useSocket : defaultOpts.useSocket;

    if (this.useSocket) {
      this.socket = io(this.socketUri, { transports: ['websocket'] });
      this.socket.emit('subscribe', 'inv');
      this.socket.on('connect', () => console.log('Socket connected!'));
      this.socket.on('event', event => console.log('event', event));
      this.socket.on('disconnect', disconnect => console.log('disconnect', disconnect));
      this.socket.on('error', error => console.log('error', error));

      // this.subscribeToEvent('block', tx => console.log('txlock', tx));
      // this.subscribeToEvent('txlock', tx => console.log('txlock', tx));
      // this.subscribeToEvent('tx', tx => console.log('tx', tx));
    }
  }

  closeSocket() {
    if (this.useSocket) {
      this.socket.close();
    }
  }

  async getAddressSummary(address) {
    const res = await axios.get(`${this.uri}/addr/${address}`);
    return res.data;
  }


  async getTransaction(transaction) {
    const res = await axios.get(`${this.uri}/tx/${transaction}`);
    return res.data;
  }

  async getUTXO(address) {
    const res = await axios.get(`${this.uri}/addr/${address}/utxo`);
    return res.data;
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

  subscribeToEvent(eventName, cb) {
    if (this.useSocket) {
      const listener = this.socket.on(eventName, cb);
      if (this.listeners[eventName]) {
        const oldListener = this.listeners[eventName].listener;
        this.clearListener(oldListener);
      }
      this.listeners[eventName] = {
        type: eventName,
        listener,
        setTime: Date.now(),
      };
      console.log('Subscribed to ', eventName);
    }
  }

  unsubscribeFromEvent(eventName) {
    if (this.listeners[eventName]) {
      this.clearListener(this.listeners[eventName].listener);
      delete this.listeners[eventName];
    }
  }

  clearListener(listener) {
    this.socket.emit('unsubscribe', listener.type);
    this.socket.removeListener(listener.listener);
  }

  subscribeToAddresses(addresses, cb) {
    if (this.useSocket) {
      const eventName = 'dashd/addresstxid';
      if (this.listeners[eventName]) {
        const oldListener = this.listeners[eventName];
        if (JSON.stringify(addresses) === JSON.stringify(oldListener.addresses)) {
          return false; // Same addresses, everything is already set
        }
        this.clearListener(oldListener);
      }
      this.socket.emit('subscribe', eventName, addresses);
      const listener = this.socket.on(eventName, cb);
      this.listeners[eventName] = {
        type: eventName,
        listener,
        addresses,
        emitter: true,
        setTime: Date.now(),
      };
      console.log('Subscribed to ', eventName);
      return true;
    }
    return false;
  }
}
module.exports = InsightClient;
