const { expect } = require('chai');
const cbor = require('cbor');
const encode = require('./encode');

describe('Account - encode', function suite() {
  this.timeout(10000);
  const jsonObject = {
    string: 'string',
    list: ['a', 'b', 'c', 'd'],
    obj: {
      int: 1,
      boolean: true,
      theNull: null,
    },
  };

  it('should encode JSON with cbor', () => {
    const encodedJSON = encode('cbor', jsonObject);
    const decoded = cbor.decodeFirstSync(encodedJSON);
    expect(decoded).to.deep.equal(jsonObject);
  });
});
