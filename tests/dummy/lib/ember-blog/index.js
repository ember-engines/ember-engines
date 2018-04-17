'use strict';

const EngineAddon = require('../../../../lib/engine-addon');

module.exports = EngineAddon.extend({
  name: 'ember-blog',

  isDevelopingAddon() {
    return true;
  },

  hintingEnabled() {
    return false;
  },

  lazyLoading: true,
});
