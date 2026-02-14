const base = 'http://127.0.0.1:3000';
const http = require('http');
const https = require('https');
function req(method, path, body, headers = {}) {
  const url = new URL(base + path);
  const lib = url.protocol === 'https:' ? https : http;
  const opts = {
    method,
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: url.pathname + (url.search || ''),
    headers: { 'Content-Type': 'application/json', ...headers },
  };
  return new Promise((resolve, reject) => {
    const r = lib.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`${method} ${path} ${res.statusCode} ${data}`));
        }
        try {
          const ct = res.headers['content-type'] || '';
          if (ct.includes('application/json')) {
            resolve(JSON.parse(data || '{}'));
          } else {
            resolve(data);
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}
async function main() {
  const health = await req('GET', '/health');
  if (!(health && health.status === 'ok')) throw new Error('health failed');
  const ts = Date.now();
  const email = `smoke+${ts}@example.com`;
  const signup = await req('POST', '/auth/signup', {
    tenantName: 'SmokeCo',
    name: 'Smoke Tester',
    email,
    password: 'Passw0rd!',
  });
  if (!signup || !signup.access_token) throw new Error('signup failed');
  const headers = { Authorization: `Bearer ${signup.access_token}` };
  const ticket = await req(
    'POST',
    '/tickets',
    {
      subject: `Smoke Test ${ts}`,
      body: 'Body for smoke test',
      customerName: 'Smoke Customer',
      customerEmail: `customer+${ts}@example.com`,
    },
    headers,
  );
  if (!ticket || !ticket._id) throw new Error('ticket creation failed');
  await req('POST', `/tickets/${ticket._id}/workflows/triage`, {}, headers);
  await req('POST', `/tickets/${ticket._id}/reply`, { body: 'Smoke test reply OK' }, headers);
  const details = await req('GET', `/tickets/${ticket._id}`, null, headers);
  const search = await req(
    'GET',
  const fs = require('fs');
  fs.writeFileSync(require('path').join(__dirname, '../../smoke-output.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
    null,
    headers,
  );
  const result = {
    health,
