'use strict';

var EngineAddon = require('../../../../lib/engine-addon');

module.exports = EngineAddon.extend({
  name: 'eager-blog',

  isDevelopingAddon: function() {
    return true;
  },

  hintingEnabled: function() {
    return false;
  },

  lazyLoading: false,
});
