// Compiles an engine's Sass at build time, so a published engine ships plain
// CSS and keeps its `import './styles.scss'` as `import './styles.css'` (the
// import is what keeps the CSS in the engine's lazy chunk).
//
// Place it before `addon.keepAssets(['**/*.css', '**/*.scss'])`: this plugin's
// load hook compiles the file, and keepAssets emits it and keeps the import.

import { fileURLToPath } from 'node:url';
import { globSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';

export function sass({ loadPaths = ['node_modules'] } = {}) {
  return {
    name: 'ember-engines-sass',

    async load(id) {
      if (!id.endsWith('.scss')) return;
      let { compileAsync, NodePackageImporter } = await import('sass-embedded');
      let result = await compileAsync(id, {
        loadPaths,
        importers: [new NodePackageImporter()],
      });
      for (let url of result.loadedUrls) {
        if (url.protocol === 'file:') this.addWatchFile(fileURLToPath(url));
      }
      return result.css;
    },

    generateBundle(_options, bundle) {
      for (let [fileName, file] of Object.entries(bundle)) {
        if (file.type === 'asset' && fileName.endsWith('.scss')) {
          delete bundle[fileName];
          this.emitFile({
            type: 'asset',
            fileName: fileName.replace(/\.scss$/, '.css'),
            source: file.source,
          });
        }
      }
      for (let file of Object.values(bundle)) {
        if (file.type === 'chunk') {
          file.code = file.code.replace(/(import\s*["'][^"']+)\.scss(["'])/g, '$1.css$2');
        }
      }
    },
  };
}

// `import.meta.glob('./pattern', { eager: true })`, with an optional trailing
// comma: the only form expandGlob() supports.
const GLOB_CALL =
  /import\.meta\.glob\(\s*(['"])([^'"]+)\1\s*(?:,\s*\{([^{}]*)\})?\s*,?\s*\)/g;

/**
 * Expands `import.meta.glob(pattern, { eager })` into static imports at build
 * time. RFC 939 lets addons use the glob in their source but not in what they
 * publish, so a v2 engine's dist can't depend on the host's Vite. Keys match
 * Vite's (`./templates/index.gts`); Ember's strict resolver drops the
 * extension. Non-eager globs become `() => import(...)` maps.
 *
 * Supported: a single string pattern starting with `./` (no `..`), and an
 * optional `{ eager: true | false }`. Anything else, including a call it can't
 * expand, fails the build rather than reaching dist. Mentions of the call in
 * comments are expanded too, so keep them out of comments.
 *
 * Place it before the babel plugin, so it sees the source.
 */
export function expandGlob({ include = /\.(js|ts|gjs|gts)$/ } = {}) {
  let counter = 0;

  return {
    name: 'expand-import-meta-glob',

    transform(code, id) {
      if (!include.test(id) || !code.includes('import.meta.glob')) return;

      const dir = dirname(id);
      const imports = [];
      const output = code.replace(
        GLOB_CALL,
        (match, _quote, pattern, options = '') => {
          if (!pattern.startsWith('./') || pattern.split('/').includes('..')) {
            this.error(
              `import.meta.glob in ${id}: "${pattern}" must start with ./ and stay inside the package (RFC 939).`,
            );
          }

          const unsupported = options
            .replace(/\beager\s*:\s*(true|false)\b/, '')
            .replace(/[\s,]/g, '');
          if (unsupported) {
            this.error(
              `import.meta.glob in ${id}: only { eager } is supported, got {${options}}.`,
            );
          }

          const eager = /\beager\s*:\s*true\b/.test(options);
          const files = globSync(pattern, { cwd: dir, withFileTypes: true })
            .filter((entry) => entry.isFile())
            .map((entry) =>
              relative(dir, join(entry.parentPath, entry.name))
                .split(sep)
                .join('/'),
            )
            .map((file) => `./${file}`)
            .filter((file) => resolve(dir, file) !== id)
            .sort();

          this.addWatchFile(dir);

          const entries = files.map((file) => {
            if (eager) {
              const name = `__glob_${counter++}`;
              imports.push(`import * as ${name} from ${JSON.stringify(file)};`);

              return `${JSON.stringify(file)}: ${name},`;
            }

            return `${JSON.stringify(file)}: () => import(${JSON.stringify(file)}),`;
          });

          // Keep the line count, so the source map still lines up.
          const newlines = match.split('\n').length - 1;

          return `{ ${entries.join(' ')} }${'\n'.repeat(newlines)}`;
        },
      );

      if (output.includes('import.meta.glob')) {
        this.error(
          `${id} still has an import.meta.glob call after expansion. Only a single string pattern with an optional { eager } object is supported.`,
        );
      }

      // Imports are hoisted, so appending them leaves every line in place.
      return { code: `${output}\n${imports.join('\n')}\n`, map: null };
    },
  };
}
