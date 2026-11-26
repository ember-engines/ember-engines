import { babel } from '@rollup/plugin-babel';
import { Addon } from '@embroider/addon-dev/rollup';
import { fileURLToPath } from 'node:url';

const addon = new Addon({ srcDir: 'src', destDir: 'dist' });

export default {
  output: addon.output(),
  plugins: [
    // Emit every module. Engines reach their own modules through
    // `import.meta.glob` in `engine.js`, which the host's Vite expands, so
    // rollup must not drop files that nothing imports statically.
    addon.publicEntrypoints(['**/*.js']),
    addon.appReexports([]),
    addon.dependencies(),
    babel({
      extensions: ['.js', '.gjs'],
      babelHelpers: 'bundled',
      configFile: fileURLToPath(new URL('./babel.publish.config.cjs', import.meta.url)),
    }),
    addon.gjs(),
    addon.keepAssets(['**/*.css']),
    addon.clean(),
  ],
};
