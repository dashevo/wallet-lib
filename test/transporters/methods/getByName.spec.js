const { expect } = require('chai');
const transporters = require('../../../src/transporters');

describe('transporters', () => {
  it('should warn on unfound Transporter class', () => {
    const expectedException1 = 'Not supported : Transport StarlinkClient';
    expect(() => transporters.getByName('StarlinkClient')).to.throw(expectedException1);
  });
  it('should get Transporter class by name', () => {
    expect(transporters.getByName('dapi')).to.equal(transporters.DAPIClient);
    expect(transporters.getByName('DAPI')).to.equal(transporters.DAPIClient);
    expect(transporters.getByName('DAPIClient')).to.equal(transporters.DAPIClient);
  });
});
