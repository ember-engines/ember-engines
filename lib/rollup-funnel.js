var fs = require('fs');
var path = require('path-posix');
var Funnel = require('broccoli-funnel');
var Plugin = require('broccoli-plugin');
var rollup = require('rollup').rollup;
var amdNameResolver = require('amd-name-resolver').moduleResolve;
var existsSync = require('exists-sync');
var FSTree = require('fs-tree-diff');
var Entry = require('fs-tree-diff/lib/entry');
var rimraf = require('rimraf');

function filter(directory, prefix, callback) {
  var results = [];
  var inodes = fs.readdirSync(directory);
  inodes.forEach(function(inode) {
    var fullPath = path.join(directory, inode);
    var currentPath = path.join(prefix, inode);
    var isDirectory = fs.statSync(fullPath).isDirectory();
    if (!isDirectory && callback(currentPath)) {
      results.push(currentPath);
    }
    if (isDirectory) {
      results = results.concat(filter(fullPath, currentPath, callback));
    } else {
      fs.readFileSync(fullPath);
    }
  });
  return results;
}

function copy(inodes) {
  inodes.forEach(function(module) {
    var inputPath = path.join(this.inputPaths[0], module);
    var outputPath = path.join(this.outputPath, module);
    this._copy(inputPath, outputPath);
  }, this);
}

/**
 * Stats a path. If it exists, it returns the stat information. Otherwise it
 * returns null.
 *
 * @param {String} path
 * @return {fs.Stats}
 */
function existsStat(path) {
  try {
    var stat = fs.statSync(path);
    return stat;
  } catch (e) {
    return null;
  }
}

// Create a subclass RollupFunnel derived from Plugin
RollupFunnel.prototype = Object.create(Plugin.prototype);
RollupFunnel.prototype.constructor = RollupFunnel;
function RollupFunnel(inputNodes, options) {
  if (!(this instanceof RollupFunnel)) {
    return new RollupFunnel(inputNodes, options);
  }

  if (!(options.include ^ options.exclude)) {
    throw new Error('Must specify exactly one of `include` or `exclude`.');
  }

  options = options || {};

  // An array and FSTree, respectively, representing the dependency graph of the
  // entry point or the non-dependency graph.
  this._depGraph = undefined;
  this._depGraphTree = undefined;
  this._nonDepGraph = undefined;
  this._nonDepGraphTree = undefined;

  Plugin.call(this, [inputNodes], {
    annotation: options.annotation,
    persistentOutput: true
  });
  this.options = options;
}

RollupFunnel.prototype._copy = Funnel.prototype._copy;

/**
 * Constructs an FSTree from the passed in paths.
 *
 * @param {Array<String>} paths
 * @return {FSTree}
 */
RollupFunnel.prototype._getFSTree = function(paths) {
  var inputPath = this.inputPaths[0];
  var entries = paths.map(function(entryPath) {
    var absolutePath = path.join(inputPath, entryPath);
    var stat = existsStat(absolutePath);

    if (!stat) {
      return;
    }

    return Entry.fromStat(entryPath, stat);
  }).filter(Boolean);

  return FSTree.fromEntries(entries);
};

RollupFunnel.prototype.build = function() {
  var inputPath = this.inputPaths[0];

  // Check for changes in the files included in the rollup
  if (this._depGraph) {
    var incomingDepGraphTree = this._getFSTree(this._depGraph);
    var depGraphPatch = this._depGraphTree.calculatePatch(incomingDepGraphTree);
    var hasDepGraphChanges = depGraphPatch.length !== 0;

    if (!hasDepGraphChanges) {
      var incomingNonDepGraphTree = this._getFSTree(this._nonDepGraph);
      var nonDepGraphPatch = this._nonDepGraphTree.calculatePatch(incomingNonDepGraphTree);
      var hasNonDepGraphChanges = nonDepGraphPatch.length !== 0;

      if (!hasNonDepGraphChanges) {
        return;
      }

      if (this.options.include) {
        return;
      }

      if (this.options.exclude) {
        FSTree.applyPatch(inputPath, this.outputPath, nonDepGraphPatch);
        return;
      }
    }
  }

  var modules = [];

  var entryExists = existsSync(path.join(inputPath, this.options.rollup.entry));
  if (!entryExists && this.options.include) {
    return;
  } else if (!entryExists && this.options.exclude) {
    modules = fs.readdirSync(inputPath);
    copy.call(this, modules);
    return;
  }

  var rollupOptions = {
    entry: this.options.rollup.entry,
    external: this.options.rollup.external || [],
    dest: 'foo.js',
    plugins: [
      {
        resolveId: function(importee, importer) {
          var moduleName;

          // This will only ever be the entry point.
          if (!importer) {
            moduleName = importee.replace(inputPath, '');
            modules.push(moduleName);
            return path.join(inputPath, importee);
          }

          // Link in the global paths.
          moduleName = amdNameResolver(importee, importer).replace(inputPath, '').replace(/^\//, '');
          var modulePath = path.join(inputPath, moduleName + '.js');
          if (existsSync(modulePath)) {
            modules.push(moduleName + '.js');
            return modulePath;
          }
        }
      }
    ]
  };

  return rollup(rollupOptions).then(function() {
    var toCopy;

    this._depGraph = modules.sort();
    this._nonDepGraph = filter(inputPath, '', function(module) {
      return modules.indexOf(module) === -1;
    }).sort();

    rimraf.sync(this.outputPath);

    if (this.options.include) {
      toCopy = this._depGraph;
    }

    if (this.options.exclude) {
      toCopy = this._nonDepGraph;
    }

    copy.call(this, toCopy);

    this._depGraphTree = this._getFSTree(this._depGraph);
    this._nonDepGraphTree = this._getFSTree(this._nonDepGraph);

    return;
  }.bind(this));
};

module.exports = RollupFunnel;
