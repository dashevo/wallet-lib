const { expect } = require('chai');
const transporters = require('../../../../../src/transporters');

const fixture = '0000025d24ebe65454bd51a61bab94095a6ad1df996be387e31495f764d8e2d9';
describe('transporters - DAPIClient - .getBestBlockHash', () => {
  const transporter = transporters.resolve('DAPIClient');

  it('should works', async () => {
    transporter.client.getBestBlockHeight = () => fixture;
    const res = await transporter.getBestBlockHeight();
    expect(res).to.deep.equal(fixture);
  });
});
