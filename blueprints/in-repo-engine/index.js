/*jshint node:true*/

var path = require('path');
var InRepoAddon = require('ember-cli/blueprints/in-repo-addon/index');
var VersionChecker = require('ember-cli-version-checker');
var stringUtil = require('ember-cli-string-utils');

var OLD_ROUTE_BLUEPRINT_PKG = 'ember-cli';
var NEW_ROUTE_BLUEPRINT_PKG = 'ember-cli-legacy-blueprints';

module.exports = {
  description: 'Creates an Engine within the current repository.',

  locals: function(options) {
    var entity    = options.entity;
    var rawName   = entity.name;
    var name      = stringUtil.dasherize(rawName);
    var namespace = stringUtil.classify(rawName);
    return {
      name: name,
      modulePrefix: name
    };
  },

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

  _setupRouteBlueprint: function() {
    var checker = new VersionChecker(this);
    var emberCliVersion = checker.for('ember-cli', 'npm');
    var routeBlueprintPkg = emberCliVersion.isAbove('2.6.0')
      ? OLD_ROUTE_BLUEPRINT_PKG
      : NEW_ROUTE_BLUEPRINT_PKG;

    this.routeBlueprint = require(routeBlueprintPkg + '/blueprints/route/index');

    this.shouldTouchRouter = this.routeBlueprint.shouldTouchRouter;
    this.shouldEntityTouchRouter = this.routeBlueprint.shouldEntityTouchRouter;
  },

  install: function(options) {
    this.options = options;
    var superResult = this._super.install.apply(this, arguments);
    this._setupRouteBlueprint();
    return superResult;
  },

  uninstall: function(options) {
    this.options = options;
    var superResult = this._super.uninstall.apply(this, arguments);
    this._setupRouteBlueprint();
    return superResult;
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

  beforeInstall: InRepoAddon.beforeInstall,

  afterInstall: function(options) {
    options.identifier = 'mount';
    InRepoAddon.afterInstall.call(this, options);
    this.routeBlueprint.afterInstall.call(this, options);
  },

  afterUninstall: function(options) {
    options.identifier = 'mount';
    this.routeBlueprint.afterUninstall.call(this, options);
  }
};
