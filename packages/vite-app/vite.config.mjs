import { defineConfig } from 'vite';
import { extensions, classicEmberSupport, ember } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';

export default defineConfig({
  plugins: [
    classicEmberSupport(),
    ember(),
    // extra plugins here
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
  ],
  // build: {
  //   target: "ES2022"
  // },
  optimizeDeps: {
    esbuildOptions: {
      target: 'ES2022'
    },
    exclude: ['ember-chat', 'ember-blog', 'eager-blog']
  }
});
