const { EventEmitter2: EventEmitter } = require('eventemitter2');

class BaseTransporter extends EventEmitter {
  constructor(props) {
    super(props);
    this.type = props.type;
    this.state = {
      block: null,
      blockHeader: null,
      addressesTransactionsMap:{},
      subscriptions: {
        blocks: null,
        blockHeaders: null,
        addresses: {},
      },
    };
  }
}
BaseTransporter.prototype.announce = require('./methods/announce');
BaseTransporter.prototype.disconnect = require('./methods/disconnect');
BaseTransporter.prototype.getAddressSummary = require('./methods/getAddressSummary');
BaseTransporter.prototype.getTransaction = require('./methods/getTransaction');
BaseTransporter.prototype.getUTXO = require('./methods/getUTXO');
BaseTransporter.prototype.sendTransaction = require('./methods/sendTransaction');

module.exports = BaseTransporter;
