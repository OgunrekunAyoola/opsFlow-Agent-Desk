const { spawnSync } = require('child_process');

function runScript(name, cmd, args, opts = {}) {
  console.log(`\n=== ${name} ===`);
  const res = spawnSync(cmd, args, { stdio: 'inherit', ...opts });
  if (res.status !== 0) {
    console.error(`${name} FAILED with code ${res.status}`);
    process.exit(res.status || 1);
  }
  console.log(`${name} OK`);
}

const rounds = Math.max(parseInt(process.env.STRESS_ROUNDS || '1', 10), 1);

for (let i = 1; i <= rounds; i += 1) {
  console.log(`\n=== ROUND ${i}/${rounds} ===`);
  runScript('Endpoints Test', 'node', ['./tests/endpoints.test.js']);
  runScript('Controllers Test', 'node', ['./tests/controllers.test.js']);
  runScript('AI Flow Test', 'node', ['./tests/ai-flow.test.js']);
  runScript('Auto-Reply Execution Test', 'node', ['./tests/auto-reply-execution.test.js']);
  runScript('Login Flow Test', 'node', ['./tests/login-flow.test.js']);
  runScript('Multi-Tenant Isolation Test', 'node', ['./tests/multi-tenant-isolation.test.js']);
  runScript('Models Test', 'node', ['./tests/models.test.js']);
}

console.log('\nAll rounds completed successfully.');
