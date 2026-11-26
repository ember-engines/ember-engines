import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildMacros } from '@embroider/macros/babel';

const macros = buildMacros({
  configure(config) {
    // @embroider/router only turns on lazy engine/route loading when this is
    // set, and only @embroider/compat sets it. Without it the router behaves
    // like the plain Ember router. NO_ACTIVE_FLAG=1 shows what happens then.
    if (!process.env.NO_ACTIVE_FLAG) {
      config.setGlobalConfig(import.meta.filename, '@embroider/core', { active: true });
    }
  },
});

// The no-compat shape: macros instead of babelCompatSupport()/templateCompatSupport().
export default {
  plugins: [
    [
      'module:babel-plugin-ember-template-compilation',
      { transforms: [...macros.templateMacros] },
    ],
    [
      'module:decorator-transforms',
      {
        runtime: {
          import: fileURLToPath(import.meta.resolve('decorator-transforms/runtime-esm')),
        },
      },
    ],
    [
      '@babel/plugin-transform-runtime',
      { absoluteRuntime: dirname(fileURLToPath(import.meta.url)) },
    ],
    ...macros.babelMacros,
  ],
  generatorOpts: { compact: false },
};
