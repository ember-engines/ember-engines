// Asserts what the spike claims about build output:
// - published engine dist has no import.meta.glob (RFC 939) and imports .css, not .scss;
// - in the host's production build nothing loaded at boot holds a lazy engine's
//   code or CSS, each lazy engine is its own JS chunk and CSS file, and eager
//   engines load at boot.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const failures = [];
const check = (ok, message) => (ok ? console.log(`ok   ${message}`) : failures.push(message));

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    let path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

for (let engine of ['blog', 'comments']) {
  let js = files(`${engine}/dist`).filter((f) => f.endsWith('.js'));
  let code = js.map((f) => readFileSync(f, 'utf8')).join('\n');
  check(!code.includes('import.meta.glob'), `${engine}/dist has no import.meta.glob`);
  check(!/import\s*["'][^"']+\.scss["']/.test(code), `${engine}/dist imports no .scss`);
  check(/import\s*["'][^"']+\.css["']/.test(readFileSync(`${engine}/dist/engine.js`, 'utf8')), `${engine}/dist/engine.js imports its CSS`);
}

// What loads at boot: everything index.html references, plus their static
// imports. Lazy chunks are only reachable through dynamic import().
let dist = 'host/dist';
let html = readFileSync(join(dist, 'index.html'), 'utf8');
let boot = new Set();
let queue = [...html.matchAll(/(?:src|href)="\/?(assets\/[^"]+)"/g)].map((m) => m[1]);
while (queue.length) {
  let file = queue.shift();
  if (boot.has(file)) continue;
  boot.add(file);
  if (!file.endsWith('.js')) continue;
  let code = readFileSync(join(dist, file), 'utf8');
  for (let m of code.matchAll(/(?:from|import)\s*"\.\/([^"]+\.(?:js|css))"/g)) queue.push(`assets/${m[1]}`);
}
let all = readdirSync(join(dist, 'assets')).map((n) => `assets/${n}`);
let read = (f) => readFileSync(join(dist, f), 'utf8');
let lazy = all.filter((f) => !boot.has(f));
let holding = (files, needle) => files.filter((f) => read(f).includes(needle));

let bootFiles = [...boot];
check(holding(bootFiles, 'Blog engine').length === 0 && holding(bootFiles, 'Comments engine').length === 0, `nothing loaded at boot holds engine templates (${bootFiles.length} boot files)`);
check(holding(bootFiles.filter((f) => f.endsWith('.css')), 'data-test-blog').length === 0 && holding(bootFiles.filter((f) => f.endsWith('.css')), 'data-test-comments').length === 0, 'no engine CSS loads at boot');

let blogJs = holding(lazy.filter((f) => f.endsWith('.js')), 'Blog engine');
let commentsJs = holding(lazy.filter((f) => f.endsWith('.js')), 'Comments engine');
check(blogJs.length === 1 && commentsJs.length === 1 && blogJs[0] !== commentsJs[0], 'each engine is its own lazy JS chunk');
let blogCss = holding(lazy.filter((f) => f.endsWith('.css')), 'data-test-blog');
let commentsCss = holding(lazy.filter((f) => f.endsWith('.css')), 'data-test-comments');
check(blogCss.length === 1 && commentsCss.length === 1 && blogCss[0] !== commentsCss[0], 'each engine has its own lazy CSS file');

// Eager engines (shop is routable, widget routeless) ship in what loads at boot,
// not in a lazy chunk.
for (let [engine, text] of [['shop', 'Shop engine (eager)'], ['widget', 'Widget engine (routeless)']]) {
  let code = files(`${engine}/dist`).filter((f) => f.endsWith('.js')).map((f) => readFileSync(f, 'utf8')).join('\n');
  check(!code.includes('import.meta.glob'), `${engine}/dist has no import.meta.glob`);
  check(holding(bootFiles, text).length === 1 && holding(lazy, text).length === 0, `the eager ${engine} engine loads at boot, not in a lazy chunk`);
}

if (failures.length) {
  for (let f of failures) console.error(`FAIL ${f}`);
  process.exit(1);
}
