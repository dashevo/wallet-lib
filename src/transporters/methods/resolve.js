const { is } = require('../../utils');

const evonetSeeds = [
  '52.26.165.185',
  '54.202.56.123',
  '54.245.133.124',
];
const palinkaSeeds = [
  '34.214.221.50',
  '54.213.18.11',
  '34.211.149.102',
  '52.38.244.67',
];
const defaultDAPIOpts = {
  seeds: evonetSeeds.map((ip) => ({ service: `${ip}:3000` })),
  timeout: 20000,
  retries: 5,
};
/**
 * Resolves a valid transporter.
 * By default, return a DAPI transporter
 *
 * @param {String|Object|Transporter} props - name of the transporter or options object
 * @param {String} props.type - name of the transporter
 * @param {String} props.devnetName - name of the devNet (for DAPIClient allows to connect to "palinka")
 * @return {boolean}
 */
module.exports = function resolve(props = { type: 'DAPIClient' }) {
  let opts = {};
  let Transporter = this.getByName('dapi');

  if (is.string(props)) {
    Transporter = this.getByName(props);
    // TODO: Remove me when DAPIClient has correct seed
    if (Transporter === this.DAPIClient) {
      opts = defaultDAPIOpts;
    }
  } else if (is.obj(props)) {
    Transporter = this.getByName(props.type || 'dapi');
    // TODO: Remove me when DAPIClient has correct seed
    if (Transporter === this.DAPIClient && !props.seeds) {
      opts = defaultDAPIOpts;
      if (props.devnetName === 'palinka') {
        opts.seeds = palinkaSeeds.map((ip) => ({ service: `${ip}:3000` }));
      }
    }
    opts = Object.assign(opts, props);
  } else {
    if (props === undefined) {
      return resolve('dapi');
    }
    // User may have specified a Transporter class that will be validated and used.
    Transporter = props;
  }

  const transporter = new Transporter(opts);
  transporter.isValid = this.validate(transporter);
  return transporter;
};
