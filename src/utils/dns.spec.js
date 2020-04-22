const { expect } = require('chai');
const { lookupSeeds } = require('./dns');

describe('Utils - DNS', async function () {
  this.timeout(5000);
  it('should lookupHostname work', async () => {
    const evonetSeeds = await lookupHostname('seed.evonet.networks.dash.org');
    expect(evonetSeeds.length).to.gte(0);
    expect(evonetSeeds[0]).to.exist;
    expect(evonetSeeds[0].service).to.exist;
    expect(evonetSeeds[0].service.split('.').length).to.equal(4);
  });
});
