const { expect } = chai;

describe('Distributable', function suite() {
  this.timeout(100000);
  describe('Load', () => {
    it('should be able to Wallet-lib from distributable file', () => {
      const newWallet = new Wallet();
      expect(newWallet).to.exist;
      const exported = newWallet.exportWallet();
      expect(exported.split(' ').length).to.equal(12);
    });
  });
});
