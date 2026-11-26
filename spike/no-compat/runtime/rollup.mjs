// Compiles an engine's Sass at build time, so a published engine ships plain
// CSS and keeps its `import './styles.scss'` as `import './styles.css'` (the
// import is what keeps the CSS in the engine's lazy chunk).
//
// Place it before `addon.keepAssets(['**/*.css', '**/*.scss'])`: this plugin's
// load hook compiles the file, and keepAssets emits it and keeps the import.

import { fileURLToPath } from 'node:url';

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

// Expands `import.meta.glob(pattern, { eager: true })` into static imports at
// build time. RFC 939 lets addons use the glob in their own code but not in
// what they publish, so an engine's dist must not depend on the host's Vite.
// Keys match Vite's (`./templates/index.gjs`); the strict resolver drops the
// extension. Non-eager globs become `() => import(...)` maps.
import { globSync } from 'node:fs';
import { dirname as pathDirname, relative as pathRelative, resolve as pathResolve } from 'node:path';

const GLOB_CALL =
  /import\.meta\.glob\(\s*(['"])([^'"]+)\1\s*(?:,\s*\{([^}]*)\})?\s*,?\s*\)/g;

export function expandGlob({ include = /\.(js|ts|gjs|gts)$/ } = {}) {
  let counter = 0;
  return {
    name: 'ember-engines-expand-glob',
    transform(code, id) {
      if (!include.test(id) || !code.includes('import.meta.glob(')) return;
      let dir = pathDirname(id);
      let imports = [];
      let output = code.replace(GLOB_CALL, (_match, _quote, pattern, options = '') => {
        const eager = /\beager\s*:\s*true\b/.test(options);
        if (!pattern.startsWith('./') && !pattern.startsWith('../')) {
          this.error(`import.meta.glob in ${id} must use a relative pattern; it can't cross package boundaries (RFC 939).`);
        }
        let files = globSync(pattern, { cwd: dir })
          .map((file) => `./${file.split('\\').join('/')}`.replace(/^\.\/\.\.\//, '../'))
          .filter((file) => pathResolve(dir, file) !== id)
          .sort();
        this.addWatchFile(dir);
        let entries = files.map((file) => {
          if (eager) {
            let name = `__glob_${counter++}`;
            imports.push(`import * as ${name} from ${JSON.stringify(file)};`);
            return `  ${JSON.stringify(file)}: ${name},`;
          }
          return `  ${JSON.stringify(file)}: () => import(${JSON.stringify(file)}),`;
        });
        return `{\n${entries.join('\n')}\n}`;
      });
      return { code: `${imports.join('\n')}\n${output}`, map: null };
    },
  };
}
