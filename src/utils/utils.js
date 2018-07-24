const { DUFFS_PER_DASH } = require('../Constants');

function dashToDuffs(dash) {
  if (dash === undefined || dash.constructor.name !== 'Number') {
    throw new Error('Can only convert a number');
  }
  return parseInt((dash * DUFFS_PER_DASH).toFixed(0), 10);
}
function duffsToDash(duffs) {
  if (duffs === undefined || duffs.constructor.name !== 'Number') {
    throw new Error('Can only convert a number');
  }
  return duffs / DUFFS_PER_DASH;
}
module.exports = { dashToDuffs, duffsToDash };