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

  return (
    checker.for('ember-cli', 'npm').gte('2.13.0') &&
    checker.for('ember-cli-babel', 'npm').gte('6.0.0') &&
    checker.for('loader.js', 'npm').gte('4.4.0')
  );
};
