'use strict';

const EngineAddon = require('../../../../lib/engine-addon');

module.exports = EngineAddon.extend({
  name: 'nested-engine',

  isDevelopingAddon() {
    return true;
  },

  hintingEnabled() {
    return false;
  },

  lazyLoading: false,
});
