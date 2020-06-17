const { ValidTransportLayerRequired } = require('../../../errors');

/**
 * @return {Promise<StatusInfo|{blocks:number}>} status
 */
async function fetchStatus() {
  if (!this.transporter.isValid) throw new ValidTransportLayerRequired('fetchStatus');
  const status = { blocks: -1 };

  try {
    return await this.transporter.getStatus();
  } catch (e) {
    status.blocks = await this.transporter.getBestBlockHeight();
  }
  return status;
}

module.exports = fetchStatus;
