'use strict';

const VersionChecker = require('ember-cli-version-checker');

/**
 * Determines if ember-engines should use the compact-reexports Babel plugin.
 *
 * @private
 * @param {EmberAddon} addon
 * @return {Boolean}
 */
module.exports = function shouldCompactReexports(addon) {
  const checker = new VersionChecker(addon);

  // We check the local ember-cli-babel version and the global ember-cli and
  // loader.js versions
  return (
    checker.for('ember-cli-babel', 'npm').satisfies('>=6.0.0') &&
    checker.for('ember-cli', 'npm').satisfies('>=2.13.0') &&
    checker.for('loader.js', 'npm').satisfies('>=4.4.0')
  );
};
