/* eslint-env node */
'use strict';

const ManifestGenerator = require('ember-asset-loader/lib/manifest-generator');

module.exports = ManifestGenerator.extend({
  name: 'ember-engines',
  manifestOptions: Object.freeze({
    bundlesLocation: 'engines-dist',
  }),
});
