'use strict';

const lint = require('mocha-eslint');

lint([
  'index.js',
  'addon',
  'addon-test-support',
  'app',
  'bin',
  'config',
  'lib',
  'node-tests',
  'tests',
  'vendor',
]);
