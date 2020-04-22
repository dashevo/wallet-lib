const { expect } = require('chai');
const { lookupHostname, getSeeds} = require('./dns');

describe('Utils - DNS', async function () {
  this.timeout(8000);
  describe('.lookupHostname()',async ()=>{
    it('should work', async () => {
      const evonetSeeds = await lookupHostname('seed.evonet.networks.dash.org');
      expect(evonetSeeds.length).to.gte(0);
      expect(evonetSeeds[0]).to.exist;
      expect(evonetSeeds[0].service).to.exist;
      expect(evonetSeeds[0].service.split('.').length).to.equal(4);
    });
  })
  describe('.getSeeds()',async ()=>{
    it('should work', async () => {
      const palinka = await getSeeds('palinka');
      expect(palinka).to.deep.equal([
            { service: '34.214.221.50:3000' },
            { service: '54.213.18.11:3000' },
            { service: '34.211.149.102:3000' },
            { service: '52.38.244.67:3000' }
          ]);

      const evonet = await getSeeds('evonet');
      expect(evonet[0]).to.exist;
      expect(evonet[0].service).to.exist;
      expect(evonet[0].service.split('.').length).to.equal(4);
    });
  })
});
