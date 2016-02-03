var Funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');

module.exports = {
  extend: function(options) {
    if (options.treeFor) {
      throw new Error('Do not provide a custom `options.treeFor` with `EngineAddon.extend(options)`.');
    }

    options.treeFor = function treeFor(name) {
      var tree, trees;

      this._requireBuildPackages();

      if (name === 'app') {
        trees = [];
      } else {
        trees = this.eachAddonInvoke('treeFor', [name]);

        if (name === 'addon') {
          var appTree = mergeTrees(this.eachAddonInvoke('treeFor', ['app']), {
            overwrite: true,
            annotation: 'Engine#treeFor (' + options.name + ' - ' + name + ')'
          });
          var funneledAppTree = new Funnel(appTree, {
            destDir: 'modules/' + options.name
          });
          trees.push(funneledAppTree);
        }
      }

      if (tree = this._treeFor(name)) {
        trees.push(tree);
      }

      if (this.isDevelopingAddon() && this.hintingEnabled() && name === 'app') {
        trees.push(this.jshintAddonTree());
      }

      return mergeTrees(trees.filter(Boolean), {
        overwrite: true,
        annotation: 'Engine#treeFor (' + options.name + ' - ' + name + ')'
      });
    };

    return options;
  }
}
