const { expect } = require('chai');
const DAPIClient = require('../../../src/transports/DAPI/DapiClient');

describe('Transports - DAPIClient', () => {
  it('should create a DAPIClient object', () => {
    const result = new DAPIClient();
    const expectedResult = 'DAPIClient';
    expect(result.constructor.name).to.equal(expectedResult);
    expect(result.type).to.equal(expectedResult);
  });
  it('should handle getAddressSummary', () => {
    const client = new DAPIClient();
    return client
      .getAddressSummary()
      .then(() => Promise.reject(new Error('Expected method to reject.')))
      .catch((err) => { expect(err.toString()).to.be.equal(new Error('Missing implementation - DAPIClient').toString()); });
  });
  it('should handle getTransaction', () => {
    const client = new DAPIClient();
    return client
      .getTransaction()
      .then(() => Promise.reject(new Error('Expected method to reject.')))
      .catch((err) => { expect(err.toString()).to.be.equal(new Error('Missing implementation - DAPIClient').toString()); });
  });
  it('should handle getUTXO', () => {
    const client = new DAPIClient();
    return client
      .getUTXO()
      .then(() => Promise.reject(new Error('Expected method to reject.')))
      .catch((err) => { expect(err.toString()).to.be.equal(new Error('Missing implementation - DAPIClient').toString()); });
  });
  it('should handle subscribeToAddresses', () => {
    const client = new DAPIClient();

    return client
      .subscribeToAddresses()
      .then(() => Promise.reject(new Error('Expected method to reject.')))
      .catch((err) => { expect(err.toString()).to.be.equal(new Error('Missing implementation - DAPIClient').toString()); });
  });
  it('should handle sendRawTransaction', () => {
    const client = new DAPIClient();

    return client
      .sendRawTransaction()
      .then(() => Promise.reject(new Error('Expected method to reject.')))
      .catch((err) => { expect(err.toString()).to.be.equal(new Error('Missing implementation - DAPIClient').toString()); });
  });
  it('should handle updateNetwork', () => {
    const client = new DAPIClient();

    return client
      .updateNetwork()
      .then(() => Promise.reject(new Error('Expected method to reject.')))
      .catch((err) => { expect(err.toString()).to.be.equal(new Error('Missing implementation - DAPIClient').toString()); });
  });
  it('should handle closeSocket', () => {
    const client = new DAPIClient();

    return client
      .closeSocket()
      .then(() => Promise.reject(new Error('Expected method to reject.')))
      .catch((err) => { expect(err.toString()).to.be.equal(new Error('Missing implementation - DAPIClient').toString()); });
  });
});
