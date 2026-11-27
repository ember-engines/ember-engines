import { babel } from '@rollup/plugin-babel';
import { Addon } from '@embroider/addon-dev/rollup';
import { expandGlob } from 'ember-engines-runtime/rollup';
import { fileURLToPath } from 'node:url';

const addon = new Addon({ srcDir: 'src', destDir: 'dist' });

export default {
  output: addon.output(),
  plugins: [
    // The glob in engine.js is expanded below, so rollup follows real imports
    // and every route module ends up reachable from engine.js.
    addon.publicEntrypoints(['engine.js', 'routes.js']),
    expandGlob(),
    addon.appReexports([]),
    addon.dependencies(),
    babel({
      extensions: ['.js', '.gjs'],
      babelHelpers: 'bundled',
      configFile: fileURLToPath(new URL('./babel.publish.config.cjs', import.meta.url)),
    }),
    addon.gjs(),
    addon.clean(),
  ],
};
