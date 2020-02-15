module.exports = function feeCalculation(type = 'standard') {
  const feeRate = {
    type: null,
    value: null,
  };

  switch (type) {
    case 'standard':
    default:
      feeRate.type = 'perBytes';
      feeRate.value = 1000;
      return feeRate;
  }
};
