'use strict';

module.exports = {
  root: true,
  extends: ['eslint:recommended', 'prettier'],
  plugins: ['prettier'],
  parserOptions: {
    ecmaVersion: 2017,
  },
  env: {
    node: true,
  },
  rules: {
    strict: [2, 'global'],
    'prettier/prettier': [
      'error',
      { singleQuote: true, trailingComma: 'es5' },
    ],
  },
};
