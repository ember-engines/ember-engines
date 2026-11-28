import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { publicAssets } from '../vite.mjs';

// The host depends on blog, whose `public-assets` include an image.
const hostDir = new URL('../../host/', import.meta.url).pathname;
const { createServer } = await import(
  pathToFileURL(createRequire(hostDir).resolve('vite')).href
);

for (const base of ['/', '/demo/']) {
  test(`the dev server serves an engine's public assets, with base ${base}`, async () => {
    const server = await createServer({
      root: hostDir,
      base,
      configFile: false,
      logLevel: 'silent',
      plugins: [publicAssets({ root: hostDir })],
      server: { port: 0 },
    });
    await server.listen();

    try {
      const origin = server.resolvedUrls.local[0];
      const asset = await fetch(new URL('blog/images/badge.svg', origin));

      assert.equal(asset.status, 200);
      assert.equal(asset.headers.get('content-type'), 'image/svg+xml');
      assert.match(await asset.text(), /<svg/);

      const missing = await fetch(new URL('blog/images/missing.svg', origin));
      assert.notEqual(missing.headers.get('content-type'), 'image/svg+xml');
    } finally {
      await server.close();
    }
  });
}
