'use strict';

const EngineAddon = require('../../../../lib/engine-addon');

module.exports = EngineAddon.extend({
  name: 'base-engine',

  isDevelopingAddon() {
    return true;
  },

  hintingEnabled() {
    return false;
  },

  lazyLoading: false,
});
