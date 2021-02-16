const logger = require('../logger');

/**
 * @abstract
 */
class AbstractAdapter {
  constructor(options) {
    this.isConfig = false;
  }

  config() {
    this.isConfig = true;
  }
}

module.exports = AbstractAdapter;
