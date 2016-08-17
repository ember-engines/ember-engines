var fs = require('fs');
var path = require('path');
var Funnel = require('broccoli-funnel');
var Plugin = require('broccoli-plugin');
var rollup = require('rollup').rollup;
var amdNameResolver = require('amd-name-resolver').moduleResolve;
var existsSync = require('exists-sync');

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

  this.originalInput = inputNodes;
  options = options || {};
  Plugin.call(this, [inputNodes], {
    annotation: options.annotation
  });
  this.options = options;
}

RollupFunnel.prototype._copy = Funnel.prototype._copy;

RollupFunnel.prototype.build = function() {
  var base = this.inputPaths[0];
  var modules = [];

  var entryExists = existsSync(path.join(this.inputPaths[0], this.options.rollup.entry));
  if (!entryExists && this.options.include) {
    return;
  } else if (!entryExists && this.options.exclude) {
    modules = fs.readdirSync(this.inputPaths[0]);
    copy.call(this, modules);
    return;
  }

  var rollupOptions = {
    entry: this.options.rollup.entry,
    dest: 'foo.js',
    plugins: [
      {
        resolveId: function(importee, importer) {
          var moduleName;

          // This will only ever be the entry point.
          if (!importer) {
            moduleName = importee.replace(base, '');
            modules.push(moduleName);
            return path.join(base, importee);
          }

          // Link in the global paths.
          moduleName = amdNameResolver(importee, importer).replace(base, '').replace(/^\//, '');
          var modulePath = path.join(base, moduleName + '.js');
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

    if (this.options.include) {
      toCopy = modules;
    }
    if (this.options.exclude) {
      toCopy = filter(this.inputPaths[0], '', function(module) {
        return !~modules.indexOf(module);
      });
    }

    copy.call(this, toCopy);
    return;
  }.bind(this));
};

module.exports = RollupFunnel;
