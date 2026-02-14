const { spawnSync } = require('child_process');
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function runScript(name, cmd, args, opts = {}) {
  console.log(`\n=== ${name} ===`);
  const res = spawnSync(cmd, args, { stdio: 'inherit', ...opts });
  if (res.status !== 0) {
    console.error(`${name} FAILED with code ${res.status}`);
    process.exit(res.status || 1);
  }
  console.log(`${name} OK`);
}

// Run endpoints and controllers (JS, axios)
runScript('Endpoints Test', 'node', ['./tests/endpoints.test.js']);
runScript('Controllers Test', 'node', ['./tests/controllers.test.js']);

// Run models test with ts-node/register from backend
runScript('Models Test', 'node', ['./tests/models.test.js']);

console.log('\nAll tests completed successfully.');
