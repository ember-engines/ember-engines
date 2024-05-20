'use strict';

const EngineAddon = require('ember-engines/lib/engine-addon');

module.exports = EngineAddon.extend({
  name: '<%= dasherizedModuleName %>',

  lazyLoading: Object.freeze({
    enabled: <%= isLazy %>
  }),

  isDevelopingAddon() {
    return true;
  }
});
