function exportState() {
  const { walletId } = this;
  const { mnemonic, paths, identities } = this.state;

  return {
    walletId,
    state: {
      mnemonic,
      paths: Object.fromEntries(paths),
      identities: Object.fromEntries(identities),
    },
  };
}
module.exports = exportState;
