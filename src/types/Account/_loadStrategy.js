const _ = require('lodash');
const { is } = require('../../utils');
const { InvalidStrategy, UnknownStrategy } = require('../../errors');
const buildInStrategies = require('../../utils/coinSelections/strategies');

const fromString = (strategyName) => {
  if (!_.has(buildInStrategies, strategyName)) return new UnknownStrategy(`Unknown strategy ${strategyName}`);
  return buildInStrategies[strategyName];
};
const fromFunction = (arg) => arg;

/* eslint-disable no-underscore-dangle */
const _loadStrategy = (arg) => {
  if (is.string(arg)) return fromString(arg);
  if (is.fn(arg)) return fromFunction(arg);
  throw new InvalidStrategy(arg);
};


module.exports = _loadStrategy;
