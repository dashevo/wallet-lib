const IdentityReplaceError = require('../../errors/IndentityIdReplaceError');
const logger = require('../../logger');

class WalletStore {
  constructor(walletId) {
    this.walletId = walletId;

    this.state = {
      mnemonic: null,
      paths: new Map(),
      identities: new Map(),
    };
  }

  createPathState(path) {
    logger.debug(`WalletStore - Creating path state ${path}`);
    if (!this.state.paths.has(path)) {
      this.state.paths.set(path, {
        path,
        addresses: {},
      });
    }
  }

  getPathState(path) {
    return this.state.paths.get(path);
  }

  getIndexedIdentityIds() {
    return [...this.state.identities.values()];
  }

  getIdentityIdByIndex(identityIndex) {
    return this.state.identities.get(identityIndex);
  }

  insertIdentityAtIndex(identityId, identityIndex) {
    const existingId = this.getIdentityIdByIndex(identityIndex);

    if (Boolean(existingId) && existingId !== identityId) {
      throw new IdentityReplaceError(`Trying to replace identity at index ${identityIndex}`);
    }

    this.state.identities.set(identityIndex, identityId);
  }
}
module.exports = WalletStore;
