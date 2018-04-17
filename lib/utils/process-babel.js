'use strict';

module.exports = function processBabel(tree) {
  const Babel = require('broccoli-babel-transpiler');

  return new Babel(tree, {
    modules: 'amdStrict',
    moduleIds: true,
    resolveModuleSource: require('amd-name-resolver').moduleResolve,
  });
}
