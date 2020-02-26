const { expect } = require('chai');
const transporters = require('../../../../../src/transporters');


const fixture = '00000020e2bddfb998d7be4cc4c6b126f04d6e4bd201687523ded527987431707e0200005520320b4e263bec33e08944656f7ce17efbc2c60caab7c8ed8a73d413d02d3a169d555ecdd6021e56d000000203000500010000000000000000000000000000000000000000000000000000000000000000ffffffff050219250102ffffffff0240c3609a010000001976a914ecfd5aaebcbb8f4791e716e188b20d4f0183265c88ac40c3609a010000001976a914ecfd5aaebcbb8f4791e716e188b20d4f0183265c88ac0000000046020019250000476416132511031b71167f4bb7658eab5c3957d79636767f83e0e18e2b9ed7f8000000000000000000000000000000000000000000000000000000000000000003000600000000000000fd4901010019250000010001d02e9ee1b14c022ad6895450f3375a8e9a87f214912d4332fa997996d2000000320000000000000032000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
describe('transporters - DAPIClient - .getBlockByHash', () => {
  const transporter = transporters.resolve('DAPIClient');

  it('should works', async () => {
    transporter.client.getBlockByHash = () => new Buffer.from(fixture, 'hex');
    const res = await transporter.getBlockByHash('0000025d24ebe65454bd51a61bab94095a6ad1df996be387e31495f764d8e2d9');
    expect(res.hash).to.equal('0000025d24ebe65454bd51a61bab94095a6ad1df996be387e31495f764d8e2d9');
  });
});
