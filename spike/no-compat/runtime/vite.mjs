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
// `modules` holds every engine's route map, plus the Engine class of eager
// engines, keyed for Ember's strict resolver. Engines are found by keyword
// (`ember-engine`) anywhere in the app's addon graph. That includes engines
// that only another engine depends on, because Ember's router builds every
// routable engine instance from the root owner.

import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, join } from 'node:path';

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

export function discoverEngines(root) {
  let engines = new Map();
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
      let keywords = dep.keywords ?? [];
      if (!keywords.includes('ember-addon')) continue;
      let meta = dep['ember-addon'] ?? {};

      if (keywords.includes('ember-engine')) {
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
          from: dir,
          lazy: Boolean(meta['lazy-engine']),
        });
      }

      // v1 addons can't hold v2 engines we could load anyway.
      if (meta.version === 2) walk(depDir, false);
    }
  }

  walk(root, true);
  return [...engines.values()].sort((a, b) => a.name.localeCompare(b.name));
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
        let routes = await this.resolve(`${engine.name}/routes`, importer);
        let entry = await this.resolve(`${engine.name}/engine`, importer);
        if (!routes || !entry) {
          throw new Error(
            `Engine ${engine.name} must export ./routes and ./engine (checked from ${engine.from}).`,
          );
        }

        imports.push(`import routes${i} from ${JSON.stringify(routes.id)};`);
        modules.push(`  ${JSON.stringify(`./route-maps/${engine.name}`)}: routes${i},`);

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
