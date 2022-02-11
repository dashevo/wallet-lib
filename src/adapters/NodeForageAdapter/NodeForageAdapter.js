const AbstractAdapter = require('../AbstractAdapter');

/**
 * @implements {Adapter}
 */
class NodeForageAdapter extends AbstractAdapter {
  constructor(adapter) {
    super();
    this.adapter = adapter;
  }
}

NodeForageAdapter.prototype.setItem = require('./methods/setItem');
NodeForageAdapter.prototype.getItem = require('./methods/getItem');

module.exports = NodeForageAdapter;
