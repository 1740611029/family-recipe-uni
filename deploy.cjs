const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const HOST_IPS = {
  'dash.cloudflare.com': '104.17.110.184',
  'api.cloudflare.com': '104.19.192.176',
};

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const hostname = u.hostname;
    const ip = HOST_IPS[hostname] || hostname;

    const req = https.request({
      hostname: ip,
      port: 443,
      path: u.pathname + u.search,
      method: options.method || 'GET',
      servername: hostname,
      headers: {
        ...options.headers,
        Host: hostname,
      },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = new URL(res.headers.location, url).href;
        res.resume();
        request(redirectUrl, options).then(resolve).catch(reject);
        return;
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks);
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          headers: res.headers,
          body: body,
          text: () => body.toString(),
          json: () => JSON.parse(body.toString()),
        });
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

const REFRESH_TOKEN = 'cfort_R6Snya8yaBX_oNYYa8nmyPFZm6onG0TAcOeV_FmMDF0.vmMlhYLgT4A_yDZTb75RiMXq5hDXafooE3PO791mskQ';
const CLIENT_ID = '54d11594-84e4-49aa-bb44-45939e8841b3';
const PROJECT_NAME = 'family-cookbook';
const DIST_DIR = path.join(__dirname, 'dist');

function readFilesRecursively(dir, base = '') {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      results.push(...readFilesRecursively(fullPath, relPath));
    } else {
      results.push({ fullPath, relPath: '/' + relPath });
    }
  }
  return results;
}

async function main() {
  console.log('1. 刷新 OAuth Token...');
  const tokenResp = await request('https://dash.cloudflare.com/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: REFRESH_TOKEN,
      client_id: CLIENT_ID,
    }),
  });
  const tokenData = tokenResp.json();
  if (!tokenData.access_token) {
    console.error('Token refresh failed:', JSON.stringify(tokenData));
    process.exit(1);
  }
  const accessToken = tokenData.access_token;
  console.log('   Token refreshed successfully');

  console.log('2. 获取 Account ID...');
  const acctResp = await request('https://api.cloudflare.com/client/v4/accounts', {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  const acctData = acctResp.json();
  if (!acctData.success || !acctData.result.length) {
    console.error('Failed to get accounts:', JSON.stringify(acctData));
    process.exit(1);
  }
  const accountId = acctData.result[0].id;
  console.log('   Account ID:', accountId);

  console.log('3. 读取 dist 目录文件...');
  const files = readFilesRecursively(DIST_DIR);
  console.log(`   Found ${files.length} files`);

  console.log('4. 计算文件哈希...');
  const manifest = {};
  const fileHashes = {};
  for (const file of files) {
    const content = fs.readFileSync(file.fullPath);
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    const b64Hash = Buffer.from(hash, 'hex').toString('base64');
    manifest[file.relPath] = b64Hash;
    fileHashes[file.relPath] = { hash: b64Hash, content };
  }

  console.log('5. 获取上传 JWT...');
  const jwtResp = await request(`https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/assets/jwt`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  const jwtData = jwtResp.json();
  if (!jwtData.success) {
    console.error('Failed to get JWT:', JSON.stringify(jwtData));
    process.exit(1);
  }
  const uploadJwt = jwtData.result.jwt;
  console.log('   Upload JWT obtained');

  console.log('6. 检查哪些文件需要上传...');
  const hashes = Object.values(fileHashes).map(f => f.hash);
  const checkResp = await request(`https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/assets/check_cache`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${uploadJwt}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ hashes }),
  });
  const checkData = checkResp.json();
  const needUpload = checkData.result || [];
  const toUpload = Object.entries(fileHashes).filter(([_, f]) => needUpload.includes(f.hash));
  console.log(`   ${toUpload.length} files need uploading`);

  console.log('7. 上传文件...');
  for (const [relPath, file] of toUpload) {
    const uploadResp = await request(
      `https://api.cloudflare.com/client/v4/pages/assets/upload?${encodeURIComponent(file.hash)}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${uploadJwt}`,
          'Content-Type': 'application/octet-stream',
        },
        body: file.content,
      }
    );
    if (uploadResp.status === 200) {
      console.log(`   Uploaded: ${relPath}`);
    } else {
      console.log(`   Upload failed for ${relPath}: ${uploadResp.status} ${uploadResp.text()}`);
    }
  }

  console.log('8. 创建部署...');
  const deployResp = await request(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${PROJECT_NAME}/deployments`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ manifest }),
    }
  );
  const deployData = deployResp.json();
  if (deployData.success) {
    const url = deployData.result.url;
    console.log(`\n=== 部署成功! ===`);
    console.log(`URL: https://${url}`);
  } else {
    console.error('Deploy failed:', JSON.stringify(deployData));
    process.exit(1);
  }
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
