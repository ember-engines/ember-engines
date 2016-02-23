/*jshint node:true*/
var EngineAddon = require('ember-engines/lib/engine-addon');
module.exports = EngineAddon.extend({
  name: '<%= dasherizedModuleName %>',

  isDevelopingAddon: function() {
    return true;
  }
});
