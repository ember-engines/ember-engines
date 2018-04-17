'use strict';

const EngineAddon = require('../../../../lib/engine-addon');

module.exports = EngineAddon.extend({
  name: 'ember-chat',

  isDevelopingAddon() {
    return true;
  },

  hintingEnabled() {
    return false;
  },

  lazyLoading: false,
});
