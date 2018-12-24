module.exports = function sign(object, privateKeys, sigType) {
  return this.keyChain.sign(object, privateKeys, sigType);
};
