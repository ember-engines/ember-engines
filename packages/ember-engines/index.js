/* eslint-env node */
'use strict';

const ManifestGenerator = require('ember-asset-loader/lib/manifest-generator');

module.exports = ManifestGenerator.extend({
  name: 'ember-engines',
  manifestOptions: Object.freeze({
    bundlesLocation: 'engines-dist',
    filesToIgnore: [/\/config\/environment.js$/],
  }),
  included() {
    this._super.included.apply(this, arguments);
    this._findHost().import('vendor/ember-engines/compat-modules-compat.js');
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
  },
  /**
   * When an engine adds addon as a dependency it gets processed as part of ember-cli
   * this causes asset loader to incorrectly capture files into the host tree
   *
   * @override */
  shouldIncludeChildAddon(childAddon) {
    if (childAddon.name === 'ember-asset-loader') {
      return false;
    } else {
      return this._super.call(this, childAddon);
    }
  },
});
