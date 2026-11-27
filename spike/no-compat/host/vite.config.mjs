import { defineConfig, defaultClientConditions } from 'vite';
import { extensions, ember } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';
import { engines } from 'ember-engines-runtime/vite';

// No classicEmberSupport(): the no-compat shape RFC 1174 proposes.
export default defineConfig(({ command }) => ({
  // The GitHub Pages demo is served from /ember-engines/.
  base: process.env.DEMO_BASE ?? '/',
  resolve: {
    // In dev, workspace engines and addons resolve to their source, so edits
    // reload without rebuilding them. Builds use their published dist.
    conditions:
      command === 'serve' ? ['workspace-source', ...defaultClientConditions] : defaultClientConditions,
  },
  plugins: [
    // NO_ENGINE_REGISTRATION=1 shows what a strict-resolver app gets today:
    // nothing registers lazy engines or their route maps.
    engines({ disabled: Boolean(process.env.NO_ENGINE_REGISTRATION) }),
    ember(),
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
  ],
}));
