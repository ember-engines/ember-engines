'use strict';

const lint = require('mocha-eslint');

lint([
  'index.js',
  'lib',
  'node-tests'
]);
