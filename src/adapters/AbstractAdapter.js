/**
 * @abstract
 */
class AbstractAdapter {
  constructor(adapter) {
    this.isConfig = false;
    this.adapter = adapter;
  }

  config() {
    this.isConfig = true;
  }
}

module.exports = AbstractAdapter;
