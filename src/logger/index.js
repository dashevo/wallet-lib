const util = require('util');
const winston = require('winston');
// Default winston transport requires setImmediate to work, so
// polyfill included here. Making it work with webpack is rather tricky, so it is used as per
// documentation: https://github.com/YuzuJS/setImmediate#usage
require('setimmediate');

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Log levels:
//   error    0
//   warn     1
//   info     2  (default)
//   verbose  3
//   debug    4
//   silly    5

const logger = winston.createLogger({
  level: LOG_LEVEL,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        {
          transform: (info) => {
            const args = info[Symbol.for('splat')];
            const result = { ...info };
            if (args) {
              result.message = util.format(info.message, ...args);
            }
            return result;
          },
        },
        winston.format.colorize(),
        winston.format.printf(({
          level, message,
        }) => `${level}: ${message}`),
      ),
    }),
  ],
});

logger.verbose(`Logger uses "${LOG_LEVEL}" level`, { level: LOG_LEVEL });

module.exports = logger;
