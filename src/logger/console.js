/* eslint-disable */
/*
 * console.js: Transport for outputting to the console.
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 */

const os = require('os');
// eslint-disable-next-line import/no-extraneous-dependencies
const { LEVEL, MESSAGE } = require('triple-beam');
// eslint-disable-next-line import/no-extraneous-dependencies
const TransportStream = require('winston-transport');

/**
 * Transport for outputting to the console.
 * @type {Console}
 * @extends {TransportStream}
 */
module.exports = class Console extends TransportStream {
  /**
   * Constructor function for the Console transport object responsible for
   * persisting log messages and metadata to a terminal or TTY.
   * @param {!Object} [options={}] - Options for this instance.
   */
  constructor(options = {}) {
    super(options);

    // Expose the name of this Transport on the prototype
    this.name = options.name || 'console';
    this.stderrLevels = this._stringArrayToSet(options.stderrLevels);
    this.consoleWarnLevels = this._stringArrayToSet(options.consoleWarnLevels);
    this.eol = options.eol || os.EOL;

    this.setMaxListeners(30);
  }

  /**
   * Core logging method exposed to Winston.
   * @param {Object} info - TODO: add param description.
   * @param {Function} callback - TODO: add param description.
   * @returns {undefined}
   */
  log(info, callback) {
    setTimeout(() => this.emit('logged', info), 1);

    // Remark: what if there is no raw...?
    if (this.stderrLevels[info[LEVEL]]) {
      if (console._stderr) {
        // Node.js maps `process.stderr` to `console._stderr`.
        // eslint-disable-next-line no-underscore-dangle
        console._stderr.write(`${info[MESSAGE]}${this.eol}`);
      } else {
        // console.error adds a newline
        console.error(info[MESSAGE]);
      }

      if (callback) {
        callback(); // eslint-disable-line callback-return
      }
      return;
    } if (this.consoleWarnLevels[info[LEVEL]]) {
      // eslint-disable-next-line no-underscore-dangle
      if (console._stderr) {
        // Node.js maps `process.stderr` to `console._stderr`.
        // in Node.js console.warn is an alias for console.error
        console._stderr.write(`${info[MESSAGE]}${this.eol}`);
      } else {
        // console.warn adds a newline
        console.warn(info[MESSAGE]);
      }

      if (callback) {
        callback(); // eslint-disable-line callback-return
      }
      return;
    }

    // eslint-disable-next-line no-underscore-dangle
    if (console._stdout) {
      // Node.js maps `process.stdout` to `console._stdout`.
      // eslint-disable-next-line no-underscore-dangle
      console._stdout.write(`${info[MESSAGE]}${this.eol}`);
    } else {
      // console.log adds a newline.
      console.log(info[MESSAGE]);
    }

    if (callback) {
      callback(); // eslint-disable-line callback-return
    }
  }

  /**
   * Returns a Set-like object with strArray's elements as keys (each with the
   * value true).
   * @param {Array} strArray - Array of Set-elements as strings.
   * @param {?string} [errMsg] - Custom error message thrown on invalid input.
   * @returns {Object} - TODO: add return description.
   * @private
   */
  // eslint-disable-next-line no-underscore-dangle
  _stringArrayToSet(strArray, errMsg) {
    if (!strArray) return {};

    // eslint-disable-next-line no-param-reassign
    errMsg = errMsg || 'Cannot make set from type other than Array of string elements';

    if (!Array.isArray(strArray)) {
      throw new Error(errMsg);
    }

    return strArray.reduce((set, el) => {
      if (typeof el !== 'string') {
        throw new Error(errMsg);
      }
      // eslint-disable-next-line no-param-reassign
      set[el] = true;

      return set;
    }, {});
  }
};
