/*jshint node:true*/
var EngineAddon = require('../../../../lib/engine-addon');

module.exports = EngineAddon.extend({
  name: 'ember-chat',

  isDevelopingAddon: function() {
    return true;
  },

  hintingEnabled: function() {
    return false;
  },

  lazyLoading: false
});
