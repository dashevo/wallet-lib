const dns = require('dns');

const evonetSeeds = [
  { service: '52.43.158.21:3000' },
  { service: '52.24.198.145:3000' },
  { service: '54.188.94.141:3000' },
  { service: '34.212.137.130:3000' },
  { service: '54.187.95.200:3000' },
  { service: '34.220.38.116:3000' },
  { service: '34.214.143.249:3000' },
  { service: '18.236.254.166:3000' },
  { service: '34.215.228.175:3000' },
  { service: '54.200.82.127:3000' },
  { service: '54.149.72.137:3000' },
  { service: '34.220.134.51:3000' },
  { service: '54.189.154.241:3000' },
  { service: '18.237.190.60:3000' },
  { service: '52.13.161.110:3000' },
  { service: '34.223.227.233:3000' },
  { service: '54.245.4.139:3000' },
  { service: '18.237.88.106:3000' },
  { service: '52.39.238.5:3000' },
  { service: '34.222.49.202:3000' },
  { service: '54.245.142.243:3000' },
  { service: '52.36.80.182:3000' },
  { service: '54.200.212.117:3000' },
  { service: '52.34.219.71:3000' },
  { service: '54.184.225.122:3000' },
  { service: '54.214.117.53:3000' },
  { service: '52.13.92.167:3000' },
  { service: '54.187.178.138:3000' },
  { service: '54.244.36.140:3000' },
  { service: '54.185.222.73:3000' },
  { service: '52.24.232.168:3000' },
  { service: '35.162.23.56:3000' },
  { service: '34.212.245.91:3000' },
  { service: '34.222.164.12:3000' },
  { service: '34.211.141.125:3000' },
  { service: '34.215.175.142:3000' },
  { service: '54.149.99.4:3000' },
  { service: '54.187.215.38:3000' },
  { service: '34.222.130.18:3000' },
  { service: '34.221.141.147:3000' },
  { service: '52.33.207.244:3000' },
  { service: '34.215.98.56:3000' },
  { service: '35.166.50.163:3000' },
  { service: '34.212.69.250:3000' },
  { service: '54.212.114.204:3000' },
  { service: '35.166.226.20:3000' },
  { service: '54.71.60.103:3000' },
  { service: '34.221.111.92:3000' },
  { service: '35.166.207.191:3000' },
  { service: '52.24.203.28:3000' },
];
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
      if (!dns.lookup) return evonetSeeds;
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
