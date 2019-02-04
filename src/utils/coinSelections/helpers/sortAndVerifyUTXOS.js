const sort = {
  by(el, params) {
    if (!params) return el;

    const key = params.property;
    const direction = (params.direction === 'ascending') ? 1 : -1;

    el.sort((a, b) => {
      let result;
      if ((a[key] < b[key])) {
        result = -1;
      } else {
        result = (a[key] > b[key]) ? 1 : 0;
      }
      return result * direction;
    });

    return el;
  },
};

const sortAndVerifyUTXOS = (utxosList, opts) => sort.by(utxosList, opts);

module.exports = sortAndVerifyUTXOS;
