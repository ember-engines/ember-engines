import { defineConfig, defaultClientConditions } from 'vite';
import { extensions, ember } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';
import { engines } from 'ember-engines-runtime/vite';

// The engine's own demo and test app. Everything, this engine included,
// runs from source; `rollup` builds the published dist separately.
export default defineConfig({
  resolve: { conditions: ['workspace-source', ...defaultClientConditions] },
  build: { outDir: 'dist-tests' },
  plugins: [engines(), ember(), babel({ babelHelpers: 'runtime', extensions })],
});
