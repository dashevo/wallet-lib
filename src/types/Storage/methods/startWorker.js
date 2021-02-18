const processStep = (self) => {
  if (self.lastModified > self.lastSave) {
    self.saveState();
  }
};
const stepExecutor = (self) => {
  if (!self.isStopped) {
    processStep(self);
    setTimeout(() => {
      stepExecutor(self);
    }, self.autosaveIntervalTime);
  }
};
/**
 * Allow to start the working interval (worker for saving state).
 * @return {void}
 */
module.exports = function startWorker() {
  this.isStopped = false;
  const self = this;

  setTimeout(() => {
    stepExecutor(self);
  }, self.autosaveIntervalTime);
};
