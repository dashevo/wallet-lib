const {
  UnknownDPA,
} = require('../errors/index');
/**
 * Get a worker by it's name
 * @param dpaName
 * @return {*}
 */
function getDPA(dpaName) {
  const loweredDPAName = dpaName.toLowerCase();
  const dpaList = Object.keys(this.plugins.workers).map(key => key.toLowerCase());
  if (dpaList.includes(loweredDPAName)) {
    return this.plugins.workers[loweredDPAName];
  }
  throw new UnknownDPA(loweredDPAName);
}

module.exports = getDPA;
