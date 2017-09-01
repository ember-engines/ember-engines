/* eslint-env node */
'use strict';

var EngineAddon = require('../../../../lib/engine-addon');

module.exports = EngineAddon.extend({
  name: 'fails-loudly',

  lazyLoading: {
    enabled: false
  },

  isDevelopingAddon() {
    return true;
  }
});
