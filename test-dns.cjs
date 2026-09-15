const dns = require('dns');
const r = new dns.Resolver();
r.setServers(['8.8.8.8']);
console.log('Testing DNS from .cjs file...');
r.resolve4('dash.cloudflare.com', (err, addrs) => {
  if (err) console.error('FAIL:', err.code, err.message);
  else console.log('OK:', addrs);
});
