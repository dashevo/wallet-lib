function markAddressAsUsed(address) {
  const searchResult = [...this.issuedPaths.entries()]
    .find(([, el]) => el.address.toString() === address.toString());
  const [, addressData] = searchResult;
  addressData.isUsed = true;
  this.maybeLookAhead();
}
module.exports = markAddressAsUsed;
