/*jshint node:true*/
'use strict';

var EngineAddon = require('ember-engines/lib/engine-addon');
var funnel = require('broccoli-funnel');
var merge = require('broccoli-merge-trees');
var stew = require('broccoli-stew');

module.exports = EngineAddon.extend({
  name: 'tree-invocation-order',

  lazyLoading: true,

  isDevelopingAddon: function() {
    return true;
  },

  included: function(app) {
    this._super.included.apply(this, arguments);

    app.import('vendor/css/tree-invocation-order-appimport.css');
    app.import('vendor/js/tree-invocation-order-appimport.js');
    this.import('vendor/css/tree-invocation-order-thisimport.css');
    this.import('vendor/js/tree-invocation-order-thisimport.js', { prepend: true });
  },

  setupPreprocessorRegistry: function(type, registry) {
    var addon = this;

    if (type !== 'self') {
      return;
    }

    registry.add('css', {
      name: 'tree-invocation-order',
      ext: 'css',
      toTree: function(tree) {
        // Save non-CSS assets so we can return them in treeForPublic
        addon.assetsFromStylesTree = stew.mv(
          funnel(tree, {include: ['**/*.!(css)']}),
          'tree-invocation-order/assets'
        );

        return tree;
      }
    });
  },

  treeForPublic: function() {
    var tree = this._super.apply(this, arguments);

    if (this.assetsFromStylesTree) {
      tree = tree ? merge([tree, this.assetsFromStylesTree]) : this.assetsFromStylesTree;
      this.assetsFromStylesTree = null;
    }

    return tree;
  }
});
