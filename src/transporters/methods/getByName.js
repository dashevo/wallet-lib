module.exports = function getByName(transporterName) {
  let Transporter;
  const name = transporterName.toString().toLowerCase();
  if (name.startsWith('dapi')) {
    Transporter = this.DAPIClient;
  } else if (name.startsWith('rpc')) {
    Transporter = this.RPCClient;
  } else if (name.startsWith('protocol')) {
    Transporter = this.ProtocolClient;
  } else if (!this[name]) {
    throw new Error(`Not supported : Transport ${transporterName}`);
  }
  return Transporter;
};
