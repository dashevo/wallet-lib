const AbstractAdapter = require('../AbstractAdapter');

/**
 * @implements {Adapter}
 */
class LocalForageAdapter extends AbstractAdapter {
  constructor(adapter) {
    super();
    this.adapter = adapter;
  }
}

LocalForageAdapter.prototype.setItem = require('./methods/setItem');
LocalForageAdapter.prototype.getItem = require('./methods/getItem');

module.exports = LocalForageAdapter;
