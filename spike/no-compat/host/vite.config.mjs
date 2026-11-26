import { defineConfig, defaultClientConditions } from 'vite';
import { extensions, ember } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';
import { engines } from 'ember-engines-runtime/vite';

// No classicEmberSupport(): the no-compat shape from ember-app-blueprint #49.
export default defineConfig(({ command }) => ({
  resolve: {
    // In dev, workspace engines and addons resolve to their source, so edits
    // reload without rebuilding them. Builds use their published dist.
    conditions:
      command === 'serve' ? ['workspace-source', ...defaultClientConditions] : defaultClientConditions,
  },
  plugins: [
    engines(),
    ember(),
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
  ],
}));
