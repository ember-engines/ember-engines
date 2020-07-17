'use strict';

const EngineAddon = require('../ember-engines/lib/engine-addon');

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
