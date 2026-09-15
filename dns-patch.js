const dns = require('dns');
const resolver = new dns.Resolver();
resolver.setServers(['8.8.8.8', '1.1.1.1']);

const origLookup = dns.lookup;
dns.lookup = function (hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  resolver.resolve4(hostname, (err, addresses) => {
    if (err || !addresses.length) {
      return origLookup(hostname, options, callback);
    }
    const ip = addresses[0];
    if (options && options.all) {
      callback(null, addresses.map(a => ({ address: a, family: 4 })));
    } else {
      callback(null, ip, 4);
    }
  });
};

dns.setDefaultResultOrder('ipv4first');
