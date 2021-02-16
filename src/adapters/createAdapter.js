const InMemoryAdapter = require('./InMemoryAdapter/InMemoryAdapter');
const LocalForageAdapter = require('./LocalForageAdapter/LocalForageAdapter');
const NodeForageAdapter = require('./NodeForageAdapter/NodeForageAdapter');

const SUPPORTED_ADAPTERS = {
  LocalForage: 'LocalForage',
  NodeForage: 'NodeForage',
};
/**
 *
 * @param {{adapter, name}} options
 * @returns {Adapter}
 */
function createAdapter(options) {
  console.log(options);
  if (options && options.name && options.adapter) {
    switch (options.name) {
      case SUPPORTED_ADAPTERS.NodeForage:
        return new NodeForageAdapter(options.adapter);
      case SUPPORTED_ADAPTERS.LocalForage:
        return new LocalForageAdapter(options.adapter);
      default:
        return new InMemoryAdapter();
    }
  }
  return new InMemoryAdapter();
}

module.exports = createAdapter;
