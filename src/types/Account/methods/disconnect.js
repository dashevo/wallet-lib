/**
 * This method will disconnect from all the opened streams, will stop all running workers
 * and force a saving of the state.
 * You want to use this method at the end of your life cycle of this lib.
 * @return {Promise<Boolean>}
 */
module.exports = async function disconnect() {
  this.isDisconnecting = true;
  if (this.transport && this.transport.disconnect) {
    await this.transport.disconnect();
  }

  if (this.plugins.workers) {
    const workersKey = Object.keys(this.plugins.workers);
    // eslint-disable-next-line no-restricted-syntax
    for (const key of workersKey) {
      // eslint-disable-next-line no-await-in-loop
      await this.plugins.workers[key].stopWorker({ force: true });
    }
  }
  if (this.storage) {
    await this.storage.saveState();
    await this.storage.stopWorker();
  }
  if (this.removeAllListeners) this.removeAllListeners();
  if (this.storage.removeAllListeners) this.storage.removeAllListeners();
  if (this.readinessInterval) {
    await clearInterval(this.readinessInterval);
    await clearTimeout(this.readinessInterval);
    delete this.readinessInterval;
  }
  return true;
};
