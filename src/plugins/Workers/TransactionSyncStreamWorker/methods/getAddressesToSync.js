const { WALLET_TYPES } = require('../../../../CONSTANTS');

module.exports = function getAddressesToSync() {
  const addressList = [];
  const { addresses } = this.storage.getStore().wallets[this.walletId];
  // addressType being external, internal or misc
  Object.keys(addresses).forEach((addressType) => {
    // if walletType === BIP44, then not only path that match can be added
    const accountAddresses = addresses[addressType];
    let accountPaths = Object.keys(accountAddresses);
    // Separate between address of account 0 and another account
    if ([WALLET_TYPES.HDPUBLIC, WALLET_TYPES.HDWALLET].includes(this.walletType)) {
      accountPaths = accountPaths.filter((path) => path.startsWith(this.BIP44PATH));
    }
    if (accountPaths.length > 0) {
      accountPaths.forEach((path) => {
        const { address } = accountAddresses[path];
        addressList.push(address);
      });
    }
  });
  return addressList;
};
