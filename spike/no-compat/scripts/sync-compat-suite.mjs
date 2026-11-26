// host-compat runs exactly the host's acceptance suite. The copy is generated,
// not committed, so the two can't drift.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

let source = readFileSync(new URL('../host/tests/acceptance/engines-test.js', import.meta.url), 'utf8');
let target = new URL('../host-compat/tests/acceptance/engines-test.js', import.meta.url);
mkdirSync(new URL('.', target), { recursive: true });
writeFileSync(target, source.replace("module('Acceptance | engines'", "module('Acceptance | engines (compat host)'"));
