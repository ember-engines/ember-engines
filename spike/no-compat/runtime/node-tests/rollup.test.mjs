import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expandGlob } from '../rollup.mjs';

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'expand-glob-'));
  for (const file of [
    'engine.ts',
    'routes/index.ts',
    'routes/webhook/edit.ts',
    'templates/index.gts',
  ]) {
    mkdirSync(join(root, file, '..'), { recursive: true });
    writeFileSync(join(root, file), '');
  }
  mkdirSync(join(root, 'routes/empty-dir'));
  return root;
}

function expand(code, root) {
  const context = {
    error(message) {
      throw new Error(message);
    },
    addWatchFile() {},
  };
  return expandGlob().transform.call(context, code, join(root, 'engine.ts'));
}

test('expands an eager glob into imports, keyed like Vite', () => {
  const root = fixture();
  try {
    const { code } = expand(
      "export default import.meta.glob('./{routes,templates}/**/*', { eager: true });",
      root,
    );
    assert.doesNotMatch(code, /import\.meta\.glob/);
    assert.match(code, /import \* as __glob_\d+ from "\.\/routes\/index\.ts";/);
    assert.match(code, /"\.\/routes\/webhook\/edit\.ts": __glob_\d+/);
    assert.match(code, /"\.\/templates\/index\.gts": __glob_\d+/);
    assert.doesNotMatch(code, /empty-dir/, 'directories are not modules');
    assert.doesNotMatch(
      code,
      /"\.\/engine\.ts"/,
      'the importing file is skipped',
    );
  } finally {
    rmSync(root, { recursive: true });
  }
});

test('expands a lazy glob into import() functions', () => {
  const root = fixture();
  try {
    const { code } = expand("x = import.meta.glob('./routes/*.ts');", root);
    assert.match(
      code,
      /"\.\/routes\/index\.ts": \(\) => import\("\.\/routes\/index\.ts"\)/,
    );
  } finally {
    rmSync(root, { recursive: true });
  }
});

test('handles the multi-line form prettier writes, keeping the line count', () => {
  const root = fixture();
  try {
    const source = [
      'x = {',
      '  ...import.meta.glob(',
      "    './routes/**/*.ts',",
      '    { eager: true },',
      '  ),',
      '};',
      'after;',
    ].join('\n');
    const { code } = expand(source, root);
    assert.doesNotMatch(code, /import\.meta\.glob/);
    assert.equal(code.split('\n').indexOf('after;'), 6);
  } finally {
    rmSync(root, { recursive: true });
  }
});

test('fails the build on anything it cannot expand', () => {
  const root = fixture();
  try {
    assert.throws(
      () => expand("import.meta.glob(['./routes/*.ts']);", root),
      /still has an import\.meta\.glob call/,
    );
    assert.throws(
      () =>
        expand(
          "import.meta.glob('./routes/*.ts', { eager: true, import: 'default' });",
          root,
        ),
      /only \{ eager \} is supported/,
    );
    assert.throws(
      () =>
        expand("import.meta.glob('./../outside/*.ts', { eager: true });", root),
      /must start with \.\/ and stay inside the package/,
    );
  } finally {
    rmSync(root, { recursive: true });
  }
});
