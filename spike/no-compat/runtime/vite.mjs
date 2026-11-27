// Registers v2 engines with a no-compat Ember app.
//
// With @embroider/compat, the generated `@embroider/virtual/compat-modules`
// does this. A strict-resolver app doesn't import that module, so this plugin
// serves `virtual:ember-engines` instead:
//
//   import { bundles, modules } from 'virtual:ember-engines';
//   window._embroiderEngineBundles_ = bundles;  // lazy engines, for @embroider/router
//   class App extends Application { modules = { ...appModules, ...modules }; }
//
// `modules` holds every routable engine's route map, plus the Engine class of
// eager engines (routable or routeless), keyed for Ember's strict resolver.
// Engines are found by keyword (`ember-engine`) anywhere in the app's addon
// graph. That includes engines that only another engine depends on, because
// Ember's router builds every routable engine instance from the root owner.

import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';

const VIRTUAL_ID = 'virtual:ember-engines';
const RESOLVED_ID = `\0${VIRTUAL_ID}`;

function readPackage(dir) {
  return JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
}

function packageDir(name, fromDir) {
  for (let dir = fromDir; ; dir = dirname(dir)) {
    let candidate = join(dir, 'node_modules', name, 'package.json');
    if (existsSync(candidate)) return realpathSync(dirname(candidate));
    if (dirname(dir) === dir) return undefined;
  }
}

// Every ember-addon the app can reach, with the package that depends on it.
// The walk follows v2 addons' dependencies only: a v1 addon can't hold a v2
// addon we could load anyway.
export function discoverAddons(root) {
  let addons = [];
  let seen = new Set();

  function walk(dir, isRoot) {
    let pkg = readPackage(dir);
    let names = Object.keys({
      ...pkg.dependencies,
      ...(isRoot ? pkg.devDependencies : {}),
    });

    for (let name of names) {
      let depDir = packageDir(name, dir);
      if (!depDir || seen.has(depDir)) continue;
      seen.add(depDir);

      let dep = readPackage(depDir);
      if (!(dep.keywords ?? []).includes('ember-addon')) continue;
      addons.push({ pkg: dep, dir: depDir, from: dir });

      if (dep['ember-addon']?.version === 2) walk(depDir, false);
    }
  }

  walk(root, true);
  return addons;
}

export function discoverEngines(root) {
  let engines = new Map();

  for (let { pkg: dep, dir: depDir, from } of discoverAddons(root)) {
    if (!dep.keywords.includes('ember-engine')) continue;

    let meta = dep['ember-addon'] ?? {};
    if (meta.version !== 2) {
      throw new Error(
        `${dep.name} is a v1 engine. v1 engines only build with @embroider/compat.`,
      );
    }
    let existing = engines.get(dep.name);
    if (existing && existing.dir !== depDir) {
      throw new Error(
        `Two copies of engine ${dep.name}: ${existing.dir} and ${depDir}. Engines are registered by name, so only one can be mounted.`,
      );
    }
    engines.set(dep.name, {
      name: dep.name,
      dir: depDir,
      from,
      lazy: Boolean(meta['lazy-engine']),
      // A routeless engine (rendered with {{mount}}) exports no route map.
      routable: Boolean(dep.exports?.['./routes']),
    });
  }

  return [...engines.values()].sort((a, b) => a.name.localeCompare(b.name));
}

// Serves and emits v2 addons' `public-assets` (engines' images, mostly) at the
// URLs they declare. Under compat, @embroider/vite's `assets()` did this, but it
// reads compat's resolver config. As there, a file in the app's own public
// folder wins.
export function publicAssets({ root = process.cwd() } = {}) {
  let assets = new Map();

  return {
    name: 'ember-addon-public-assets',

    configResolved({ publicDir }) {
      assets = new Map();
      for (let { pkg, dir } of discoverAddons(root)) {
        let meta = pkg['ember-addon'] ?? {};
        if (meta.version !== 2) continue;

        for (let [file, url] of Object.entries(meta['public-assets'] ?? {})) {
          let path = posix.resolve('/', url);
          if (publicDir && existsSync(join(publicDir, path))) continue;
          assets.set(path, join(dir, file));
        }
      }
    },

    // Hands the request to Vite's /@fs/ file serving (content type, caching)
    // before the SPA fallback answers it with index.html.
    configureServer(server) {
      let base = server.config.base;
      server.middlewares.use((req, _res, next) => {
        let path = req.url?.split('?')[0];
        if (path?.startsWith(base)) path = `/${path.slice(base.length)}`;
        let file = path && assets.get(path);
        if (file) req.url = `/@fs${file}`;
        next();
      });
    },

    generateBundle() {
      for (let [path, file] of assets) {
        this.emitFile({
          type: 'asset',
          fileName: path.slice(1),
          source: readFileSync(file),
        });
      }
    },
  };
}

export function engines({ root = process.cwd(), disabled = false } = {}) {
  let found = [];

  return {
    name: 'ember-engines',
    enforce: 'pre',

    config() {
      found = disabled ? [] : discoverEngines(root);
    },

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },

    async load(id) {
      if (id !== RESOLVED_ID) return;

      let imports = [];
      let modules = [];
      let bundles = [];

      for (let [i, engine] of found.entries()) {
        let importer = join(engine.from, 'package.json');
        let entry = await this.resolve(`${engine.name}/engine`, importer);
        if (!entry) {
          throw new Error(`Engine ${engine.name} must export ./engine (checked from ${engine.from}).`);
        }

        // The router loads a lazy engine when one of its routes is entered, so a
        // lazy engine must have a route map.
        if (engine.lazy && !engine.routable) {
          throw new Error(`Lazy engine ${engine.name} must export ./routes (checked from ${engine.from}).`);
        }
        if (engine.routable) {
          let routes = await this.resolve(`${engine.name}/routes`, importer);
          if (!routes) {
            throw new Error(`Engine ${engine.name} exports ./routes, but it doesn't resolve (checked from ${engine.from}).`);
          }
          imports.push(`import routes${i} from ${JSON.stringify(routes.id)};`);
          modules.push(`  ${JSON.stringify(`./route-maps/${engine.name}`)}: routes${i},`);
        }

        if (engine.lazy) {
          bundles.push(
            `  {\n    names: ${JSON.stringify([engine.name])},\n` +
              `    load: () => import(${JSON.stringify(entry.id)}).then((m) => ({ default: { ${JSON.stringify(`./engines/${engine.name}`)}: m } })),\n  },`,
          );
        } else {
          imports.push(`import * as engine${i} from ${JSON.stringify(entry.id)};`);
          modules.push(`  ${JSON.stringify(`./engines/${engine.name}`)}: engine${i},`);
        }
      }

      return [
        ...imports,
        '',
        `export const engines = ${JSON.stringify(found.map(({ name, lazy }) => ({ name, lazy })))};`,
        '',
        `export const modules = {\n${modules.join('\n')}\n};`,
        '',
        `export const bundles = [\n${bundles.join('\n')}\n];`,
        '',
      ].join('\n');
    },
  };
}
