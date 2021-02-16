const logger = require('../../logger');
const AbstractAdapter = require('../AbstractAdapter');

/**
 * @implements {Adapter}
 */
class InMemoryAdapter extends AbstractAdapter {
  constructor() {
    super();
    logger.warn('Using InMemoryAdapter. Data will not persist.');
    this.keys = {};
  }
}

InMemoryAdapter.prototype.setItem = require('./methods/setItem');
InMemoryAdapter.prototype.getItem = require('./methods/getItem');

module.exports = InMemoryAdapter;
