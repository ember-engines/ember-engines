/*jshint node:true*/

var path = require('path');
var InRepoAddon = require('ember-cli/blueprints/in-repo-addon/index');
var Route = require('ember-cli/blueprints/route/index');

module.exports = {
  description: 'Creates an Engine within the current repository.',

  availableOptions: [
    {
      name: 'type',
      type: [ 'routable', 'routeless' ],
      default: 'routable',
      aliases: [
        { 'routable': 'routable' },
        { 'routeless': 'routeless' }
      ]
    }
  ],

  install: function(options) {
    this.options = options;
    return this._super.install.apply(this, arguments);
  },

  uninstall: function(options) {
    this.options = options;
    return this._super.uninstall.apply(this, arguments);
  },

  filesPath: function() {
    var type = this.options && this.options.type || 'routable';
    return path.join(this.path, type + '-files');
  },

  // TODO: supportsAddon normally calls `files` which means that `filesPath`
  // gets called before options get set. Likely needs to be fixed upstream.
  supportsAddon: function() {
    return false;
  },

  shouldTouchRouter: Route.shouldTouchRouter,
  shouldEntityTouchRouter: Route.shouldEntityTouchRouter,

  beforeInstall: InRepoAddon.beforeInstall,

  afterInstall: function(options) {
    options.identifier = 'mount';
    InRepoAddon.afterInstall.call(this, options);
    Route.afterInstall.call(this, options);
  },

  afterUninstall: function(options) {
    options.identifier = 'mount';
    Route.afterUninstall.call(this, options);
  }
};
