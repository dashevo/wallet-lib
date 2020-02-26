const _ = require('lodash');
const { EventEmitter2: EventEmitter } = require('eventemitter2');
const { InjectionToPluginUnallowed } = require('../errors');
const { SAFE_FUNCTIONS, SAFE_PROPERTIES } = require('../CONSTANTS').INJECTION_LISTS;

const defaultOpts = {
  executeOnStart: false,
};

class StandardPlugin extends EventEmitter {
  constructor(opts = {}) {
    super();
    this.pluginType = _.has(opts, 'type') ? opts.type : 'Standard';
    this.name = _.has(opts, 'name') ? opts.name : 'UnnamedPlugin';
    this.dependencies = _.has(opts, 'dependencies') ? opts.dependencies : [];

    this.executeOnStart = _.has(opts, 'executeOnStart')
      ? opts.executeOnStart
      : defaultOpts.executeOnStart;

    // Apply other props
    Object.keys(opts).forEach((key) => {
      if (!this[key]) {
        this[key] = opts[key];
      }
    });
  }

  async startPlugin() {
    const self = this;
    // every minutes, check the pool
    if (this.executeOnStart === true) {
      if (this.onStart) {
        await this.onStart();
      }
    }
    const eventType = `PLUGIN/${this.name.toUpperCase()}/STARTED`;
    self.parentEvents.emit(eventType, { type: eventType, payload: null });
  }

  inject(name, obj, allowSensitiveOperations = false) {
    const PLUGINS_NAME_LIST = [];
    if (SAFE_FUNCTIONS.includes(name) || SAFE_PROPERTIES.includes(name)) {
      this[name] = obj;
    } else if (PLUGINS_NAME_LIST.includes(name)) {
      throw new Error('Inter-plugin support yet to come');
    } else if (allowSensitiveOperations === true) {
      this[name] = obj;
    } else if (name === 'parentEvents') {
      // Called by injectPlugin to setup the parentEvents on/emit fn.
      this.parentEvents = obj;
    } else {
      throw new InjectionToPluginUnallowed(name);
    }
    return true;
  }
}

module.exports = StandardPlugin;
