/* eslint-env node */
'use strict';

const ManifestGenerator = require('ember-asset-loader/lib/manifest-generator');

module.exports = ManifestGenerator.extend({
  name: 'ember-engines',
  manifestOptions: Object.freeze({
    bundlesLocation: 'engines-dist',
    filesToIgnore: [/\/config\/environment.js$/],
  }),
  _getAddonOptions() {
    return (
      (this.parent && this.parent.options) ||
      (this.app && this.app.options) ||
      {}
    );
  },
  /**
   * Hook in an add a babel plugin to strip embroider virtual compat modules
   * in classic builds that don't use embroider
   *
   */
  included() {
    this._super.included.apply(this, arguments);
    let app = this.parent;
    while (app.parent) {
      app = app.parent;
    }
    if (!('@embroider/core' in app.dependencies())) {
      let addonOptions = this._getAddonOptions();
      addonOptions.babel = addonOptions.babel || {};
      addonOptions.babel.plugins = addonOptions.babel.plugins || [];
      const babelPlugins = addonOptions.babel.plugins;
      const compatModulesPlugin = require.resolve(
        './lib/babel-plugin-strip-compat-modules',
      );
      if (!babelPlugins.find((plugin) => plugin[0] === compatModulesPlugin)) {
        babelPlugins.push(compatModulesPlugin);
      }
    }
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
