/* jshint node: true */
'use strict';

var ManifestGenerator = require('ember-asset-loader/lib/manifest-generator');

module.exports = ManifestGenerator.extend({
  name: 'ember-engines',
  manifestOptions: {
    bundlesLocation: 'engines-dist'
  },

  /**
   * When using ember-engines in conjunction with ember-cli-fastboot, this will
   * load the Node.js version of the asset-manifest into the FastBoot sandbox.
   *
   * @override
   */
  updateFastBootManifest(manifest) {
    manifest.vendorFiles.push('assets/node-asset-manifest.js');
    return manifest;
  }
});
