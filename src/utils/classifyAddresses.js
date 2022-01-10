const { map, filter, difference } = require('lodash');
const { WALLET_TYPES, BIP44_LIVENET_ROOT_PATH, BIP44_TESTNET_ROOT_PATH } = require('../CONSTANTS');

function classifyAddresses(walletStore, accountIndex, walletType, network) {
  const externalAddressesList = [];
  const internalAddressesList = [];
  const otherAccountAddressesList = [];
  const miscAddressesList = [];

  const rootPath = (network.toString() === 'testnet')
    ? BIP44_TESTNET_ROOT_PATH
    : BIP44_LIVENET_ROOT_PATH;

  const accountsPaths = [...walletStore.state.paths.keys()];

  const currentAccountPath = `${rootPath}/${accountIndex}'`;

  accountsPaths.forEach((accountPath) => {
    const isCurrentAccountPath = accountPath === currentAccountPath;
    const accountPaths = walletStore.getPathState(accountPath);
    Object.entries(accountPaths.addresses)
      .forEach(([path, address]) => {
        if (isCurrentAccountPath && path.startsWith('m/0')) externalAddressesList.push(address);
        else if (isCurrentAccountPath && path.startsWith('m/1')) internalAddressesList.push(address);
        else if (isCurrentAccountPath) miscAddressesList.push(address);
        else otherAccountAddressesList.push(address);
      });
  });

  return {
    externalAddressesList,
    internalAddressesList,
    otherAccountAddressesList,
    miscAddressesList,
  };
}
module.exports = classifyAddresses;
