const { expect } = require('chai');
const DAPIClient = require('../../../src/transports/DAPI/DapiClient');

describe('Transports - DAPIClient', () => {
  it('should create a DAPIClient object', () => {
    const result = new DAPIClient();
    const expectedResult = 'DAPIClient'
    expect(result.constructor.name).to.equal(expectedResult);
    expect(result.type).to.equal(expectedResult);
  });
});
