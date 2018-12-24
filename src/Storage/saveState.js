/**
 * Force persistance of the state to the adapter
 * @return {Promise<boolean>}
 */
const saveState = async function () {
  if (this.autosave && this.adapter && this.adapter.setItem) {
    const self = this;
    try {
      await this.adapter.setItem('transactions', { ...self.store.transactions });
      await this.adapter.setItem('wallets', { ...self.store.wallets });
      this.lastSave = +new Date();

      return true;
    } catch (e) {
      console.log('Storage saveState err', e);
      throw e;
    }
  }
  return false;
};
module.exports = saveState;
