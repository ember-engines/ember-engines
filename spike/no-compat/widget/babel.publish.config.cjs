'use strict';

module.exports = {
  plugins: [
    ['babel-plugin-ember-template-compilation', { targetFormat: 'hbs', transforms: [] }],
    ['module:decorator-transforms', { runtime: { import: 'decorator-transforms/runtime-esm' } }],
  ],
  generatorOpts: { compact: false },
};
