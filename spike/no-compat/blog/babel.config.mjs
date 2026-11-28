import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildMacros } from '@embroider/macros/babel';

const macros = buildMacros();

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
