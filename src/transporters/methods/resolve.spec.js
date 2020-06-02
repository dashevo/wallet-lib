const { expect } = require('chai');
const transporters = require('../index');

describe('transporters', function suite() {
  this.timeout(10000);
  it('should resolve dapi as default transporter', () => {
    const defaultTransporter = transporters.resolve();
    expect(defaultTransporter).to.be.instanceOf(transporters.DAPIClientWrapper);
  });
  it('should resolve transporters from string', () => {
    const opts = 'dapi';
    const dapiTransporter = transporters.resolve(opts);
    expect(dapiTransporter).to.be.instanceOf(transporters.DAPIClientWrapper);

    const rpcTransporter = transporters.resolve('RPCCLient');
    expect(rpcTransporter).to.be.instanceOf(transporters.RPCClient);
  });
  it('should resolve transporters from object', () => {
    const optsRPC = {
      type: 'RPC',
      ip: '0.0.0.0',
    };
    const optsDAPI = {
      type: 'DAPIClientWrapper',
      seeds: [{ service: '18.236.131.253:3000' }],
    };
    const dapiTransporter = transporters.resolve(optsDAPI);
    expect(dapiTransporter).to.be.instanceOf(transporters.DAPIClientWrapper);

    const rpcTransporter = transporters.resolve(optsRPC);
    expect(rpcTransporter).to.be.instanceOf(transporters.RPCClient);


    const dapiTransporter2 = transporters.resolve({ type: 'dapi', seeds: [{ service: '18.236.131.253:3000' }] });
    expect(dapiTransporter2).to.be.instanceOf(transporters.DAPIClientWrapper);
    expect(dapiTransporter2.type).to.be.equal('DAPIClientWrapper');
  });
  it('should extend passed options', () => {
    const options = {
      type: 'DAPIClientWrapper',
      seeds: [{service: '123.4.5.6'}]
    }

    const client = transporters.resolve(options);
    expect(client.client.MNDiscovery.seeds).to.be.deep.equal(options.seeds);
  });
  it('should resolves the transporter passed as a props', function () {
    const client = new transporters.DAPIClientWrapper({
      seeds: [{service: '123.4.5.6'}],
      timeout: 1000,
      retries: 5,
      network: this.network
    });
    expect(transporters.resolve(client)).to.deep.equal(client);
  });
});
