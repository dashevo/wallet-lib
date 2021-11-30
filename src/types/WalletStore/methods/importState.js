function importState(state) {
  this.walletId = state.walletId;
  this.state.mnemonic = state.state.mnemonic;
  this.state.paths = new Map(Object.entries(state.state.paths));
  this.state.identities = new Map(Object.entries(state.state.identities));
}
module.exports = importState;
