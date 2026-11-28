// Runs the host suite with a toggle that removes one piece of the no-compat
// wiring, and passes only if the suite fails with the expected message.
// Usage: node scripts/expect-failure.mjs NO_ACTIVE_FLAG "<expected text>"
import { spawnSync } from 'node:child_process';

let [toggle, expected] = process.argv.slice(2);
let result = spawnSync('pnpm', ['--filter', 'host', 'test'], {
  env: { ...process.env, [toggle]: '1' },
  encoding: 'utf8',
});
let output = `${result.stdout}\n${result.stderr}`;
let passed = (output.match(/^ok /gm) ?? []).length;
let failed = (output.match(/^not ok /gm) ?? []).length;

if (result.status === 0) {
  console.error(`FAIL with ${toggle}=1 the host suite passed; it should fail`);
  process.exit(1);
}
if (!output.includes(expected)) {
  console.error(`FAIL with ${toggle}=1 the suite failed, but not with "${expected}"`);
  console.error(output.split('\n').filter((l) => /message:|Error/.test(l)).slice(0, 8).join('\n'));
  process.exit(1);
}
console.log(`ok   with ${toggle}=1: ${failed} failed, ${passed} passed, with "${expected}"`);
