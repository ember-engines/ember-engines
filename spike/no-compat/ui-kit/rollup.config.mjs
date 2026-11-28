import { babel } from '@rollup/plugin-babel';
import { Addon } from '@embroider/addon-dev/rollup';
import { fileURLToPath } from 'node:url';

const addon = new Addon({ srcDir: 'src', destDir: 'dist' });

export default {
  output: addon.output(),
  plugins: [
    addon.publicEntrypoints(['**/*.js']),
    addon.appReexports(['services/**/*.js', 'components/**/*.js']),
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
