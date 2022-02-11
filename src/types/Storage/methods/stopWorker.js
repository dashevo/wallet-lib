/**
 * Allow to stop the Storage executor (worker).
 * @return {boolean}
 */
module.exports = function stopWorker() {
  this.isStopped = true;
  return true;
};
