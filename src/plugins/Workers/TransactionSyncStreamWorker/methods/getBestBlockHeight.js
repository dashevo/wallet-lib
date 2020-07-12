/**
 * Return best block height
 * @return {number}
 */
module.exports = async function getBestBlockHeight() {
  return this.transporter.getBestBlockHeight();
};
