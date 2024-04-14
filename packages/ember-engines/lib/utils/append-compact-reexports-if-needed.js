'use strict';

const BABEL_COMPACT_REEXPORTS_PLUGIN = require.resolve(
  'babel-plugin-compact-reexports',
);

module.exports = function appendCompactReexportsIfNeeded(pluginsList) {
  if (pluginsList.includes(BABEL_COMPACT_REEXPORTS_PLUGIN)) {
    return pluginsList;
  }

  pluginsList.push(BABEL_COMPACT_REEXPORTS_PLUGIN);

  return pluginsList;
};

module.exports.path = BABEL_COMPACT_REEXPORTS_PLUGIN;
