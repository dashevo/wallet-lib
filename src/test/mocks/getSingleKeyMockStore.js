function getSingleKeyMockStore() {
  const mockStore = {
    transactions: {},
    wallets: {
      f03f3fa4b5: {
        accounts: {
          0: {
            label: null,
            network: 'testnet',
            blockHeight: 458971,
            blockHash: '00000072edc9e031ff7aa3eb529511538c8a4899d5befea28848578e06c73313',
          },
        },
      },
    },
  };
  return mockStore;
}
module.exports = getSingleKeyMockStore;