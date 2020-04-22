const dns = require('dns');

const palinkaSeeds = [
  '34.214.221.50',
  '54.213.18.11',
  '34.211.149.102',
  '52.38.244.67',
].map((ip) => ({ service: `${ip}:3000` }));

const lookupHostname = async function lookupHostname(hostname) {
  return new Promise((resolve) => {
    dns.lookup(hostname, {
      all: true,
    }, (err, records) => {
      if (err) throw err;
      const seeds = records.map((record) => ({ service: `${record.address}:3000` }));
      resolve(seeds);
    });
  });
};
const getSeeds = async function getSeeds(devnetName = 'evonet') {
  switch (devnetName) {
    case 'evonet':
      return lookupHostname('seed.evonet.networks.dash.org');
    case 'palinka':
      return palinkaSeeds;
    default:
      throw new Error(`Devnet ${devnetName} have not known seed`);
  }
};

module.exports = {
  getSeeds,
  lookupHostname,
};
