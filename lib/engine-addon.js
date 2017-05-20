'use strict';

var Funnel = require('broccoli-funnel');
var merge = require('lodash/merge');
var mergeTrees = require('ember-cli/lib/broccoli/merge-trees');
var fs = require('fs');
var path = require('path');
var writeFile = require('broccoli-file-creator');
var Babel = require('broccoli-babel-transpiler');
var concat = require('broccoli-concat');
var DependencyFunnel = require('broccoli-dependency-funnel');
var defaultsDeep = require('lodash/defaultsDeep');
var calculateCacheKeyForTree = require('calculate-cache-key-for-tree');
var Addon = require('ember-cli/lib/models/addon');
var memoize = require('./utils/memoize');
var p = require('ember-cli-preprocess-registry/preprocessors');
var CompactReexports = require('babel-plugin-compact-reexports');
var shouldCompactReexports = require('./utils/should-compact-reexports');
var preprocessCss = p.preprocessCss;
var preprocessMinifyCss = p.preprocessMinifyCss;
var BroccoliDebug = require('broccoli-debug');

// Older versions of Ember-CLI may not have the Addon's tree cache
var HAS_TREE_CACHE = !!Addon._treeCache;
var EOL = require('os').EOL;
var DEFAULT_CONFIG = {
  outputPaths: {
    vendor: {
      css: '/assets/engine-vendor.css',
      js: '/assets/engine-vendor.js',
    },
  },
  trees: {
    addon: 'addon',
  },
  minifyCSS: {},
};

var DEFAULT_BABEL_CONFIG = {
  modules: 'amdStrict',
  moduleIds: true,
  resolveModuleSource: require('amd-name-resolver').moduleResolve,
};

function processBabel(tree) {
  var options = defaultsDeep({}, DEFAULT_BABEL_CONFIG);
  return new Babel(tree, options);
}

function findRoot() {
  var current = this;
  var app;

  // Keep iterating upward until we don't have a grandparent.
  // Has to do this grandparent check because at some point we hit the project.
  do {
    app = current.app || app;
  } while (current.parent.parent && (current = current.parent));

  return app;
}

function findHost() {
  var current = this;
  var app;

  // Keep iterating upward until we don't have a grandparent.
  // Has to do this grandparent check because at some point we hit the project.
  do {
    if (current.lazyLoading.enabled === true) {
      return current;
    }
    app = current.app || app;
  } while (current.parent.parent && (current = current.parent));

  return app;
}

function findHostsHost() {
  var foundHost = false;
  var current = this;
  var app;

  // Keep iterating upward until we don't have a grandparent.
  // Has to do this grandparent check because at some point we hit the project.
  do {
    if (current.lazyLoading.enabled === true) {
      if (foundHost) {
        return current;
      }

      foundHost = true;
    }

    app = current.app || app;
  } while (current.parent.parent && (current = current.parent));

  return foundHost && app;
}

/**
  This is an extraction of what would normally be run by the `treeFor` hook.
  Because we call it in two different places we've moved it to a utility function.
 */
var buildChildAppTree = memoize(function buildChildAppTree() {
  var treesForApp = this.eachAddonInvoke('treeFor', ['app']);
  return mergeTrees(treesForApp, { overwrite: true });
});

/**
  The config tree is a new concept for an engine.
  We need to build a separate config file for it.
 */
var buildConfigTree = memoize(function buildConfigTree() {
  // Include a module that reads the engine's configuration from its
  // meta tag and exports its contents.
  var configContents = this.getEngineConfigContents();
  var configTree = writeFile('config/environment.js', configContents);

  return configTree;
});

var buildExternalTree = memoize(function buildExternalTree() {
  var vendorPath = path.resolve(this.root, this.treePaths['vendor']);
  if (!fs.existsSync(vendorPath)) {
    return;
  }

  return new Funnel(vendorPath, {
    destDir: 'vendor',
  });
});

var buildVendorTree = memoize(function buildVendorTree() {
  // Manually invoke the child addons addon trees.
  var childAddonsAddonTrees = this.nonDuplicatedAddonInvoke('treeFor', [
    'addon',
    'buildVendorTree',
  ]);
  var childAddonsAddonTreesMerged = mergeTrees(childAddonsAddonTrees, {
    overwrite: true,
  });

  return childAddonsAddonTreesMerged;
});

var buildVendorJSTree = memoize(function buildVendorJSTree(vendorTree) {
  // Filter out the JS so that we can process it correctly.
  var vendorJSTree = new Funnel(vendorTree, {
    include: ['**/*.js'],
    exclude: ['vendor/**/*.*'],
  });

  return vendorJSTree;
});

var buildVendorCSSTree = memoize(function buildVendorCSSTree(vendorTree) {
  // Filter out the CSS so that we can process it correctly.
  var vendorCSSTree = new Funnel(vendorTree, {
    include: ['**/*.css'],
    exclude: ['vendor/**/*.*'],
  });

  return this.debugTree(vendorCSSTree, 'vendor-style:input');
});

var buildEngineJSTree = memoize(function buildEngineJSTree() {
  var engineSourceTree;
  var treePath;
  var addonTree = this.options.trees.addon;

  if (typeof addonTree === 'string') {
    treePath = path.resolve(this.root, addonTree);
  }

  if (treePath && fs.existsSync(treePath)) {
    engineSourceTree = this.treeGenerator(treePath);
  } else {
    engineSourceTree = addonTree;
  }

  // We want the config and child app trees to be compiled with the engine source
  var configTree = buildConfigTree.call(this);
  var childAppTree = buildChildAppTree.call(this);
  var augmentedEngineTree = mergeTrees(
    [configTree, childAppTree, engineSourceTree].filter(Boolean),
    { overwrite: true }
  );
  var engineTree = this.compileAddon(augmentedEngineTree);

  return engineTree;
});

var buildEngineJSTreeWithoutRoutes = memoize(
  function buildEngineJSTreeWithoutRoutes() {
    var engineJSTree = buildEngineJSTree.call(this);
    return new DependencyFunnel(engineJSTree, {
      exclude: true,
      entry: this.name + '/routes.js',
      external: ['ember-engines/routes'],
    });
  }
);

var buildEngineRoutesJSTree = memoize(function buildEngineRoutesJSTree() {
  // Get complete engine JS tree
  var engineAppTree = buildEngineJSTree.call(this);
  // Separate routes
  var engineRoutesTree = new DependencyFunnel(engineAppTree, {
    include: true,
    entry: this.name + '/routes.js',
    external: ['ember-engines/routes'],
  });
  // If babel options aren't defined, we need to transpile the modules.
  if (!this.options || !this.options.babel) {
    engineRoutesTree = processBabel(engineRoutesTree);
  }
  // Concatenate routes.js and its dependencies into a single file.
  engineRoutesTree = concat(engineRoutesTree, {
    allowNone: true,
    inputFiles: ['**/*.js'],
    outputFile: 'engines-dist/' + this.name + '/assets/routes.js',
  });
  // Return concatenated JS tree
  return this.debugTree(engineRoutesTree, 'routes:output');
});

var buildVendorJSWithImports = memoize(function buildVendorJSWithImports(
  concatTranspiledVendorJSTree
) {
  var externalTree = buildExternalTree.call(this);
  var combined = mergeTrees(
    [externalTree, concatTranspiledVendorJSTree].filter(Boolean),
    { overwrite: true }
  );

  var vendorFiles = [];
  for (var outputFile in this._scriptOutputFiles) {
    var inputFiles = this._scriptOutputFiles[outputFile];

    vendorFiles.push(
      concat(combined, {
        headerFiles: inputFiles,
        outputFile: 'engines-dist/' + this.name + outputFile,
        separator: EOL + ';',
        annotation: 'Concat: Vendor ' + outputFile,
        allowNone: true,
      })
    );
  }

  return mergeTrees(vendorFiles, { overwrite: true });
});

var buildVendorCSSWithImports = memoize(function buildVendorCSSWithImports(
  concatVendorCSSTree
) {
  var externalTree = buildExternalTree.call(this);
  var combined = mergeTrees(
    [externalTree, concatVendorCSSTree].filter(Boolean),
    { overwrite: true }
  );

  var vendorFiles = [];
  for (var outputFile in this._styleOutputFiles) {
    var inputFiles = this._styleOutputFiles[outputFile];

    vendorFiles.push(
      concat(combined, {
        inputFiles: inputFiles,
        outputFile: 'engines-dist/' + this.name + outputFile,
        annotation: 'Concat: Vendor ' + outputFile,
        allowNone: true,
      })
    );
  }

  return mergeTrees(vendorFiles, { overwrite: true });
});

var buildCompleteJSTree = memoize(function buildCompleteJSTree() {
  var vendorTree = buildVendorTree.call(this);
  var vendorJSTree = buildVendorJSTree.call(this, vendorTree);
  var engineAppTree = buildEngineJSTree.call(this);

  return mergeTrees([vendorJSTree, engineAppTree], { overwrite: true });
});

/*
  Small helper function to reduce extra effort when invoking
  `mergeTrees([])` or `mergeTrees([something])`.

  @param {Array} _inputTrees an array of potential trees to merge
  @return {Tree|undefined}
*/
function maybeMergeTrees(_inputTrees, options) {
  var inputTrees = _inputTrees.filter(Boolean);
  if (inputTrees.length > 1) {
    return mergeTrees(inputTrees, options);
  } else {
    return inputTrees[0];
  }
}

var buildEngineStyleTree = memoize(function buildEngineStyleTree() {
  // gather engines own `addon/styles` and its dependencies `app/styles`
  var engineStylesTree = this._treeFor('addon-styles');
  var dependencyStyleTrees = this.nonDuplicatedAddonInvoke('treeFor', [
    'styles',
  ]);
  var dependencyStyleTree = maybeMergeTrees(dependencyStyleTrees, {
    overwrite: true,
  });
  var relocatedDependencyStyleTree;

  // if dependency styles trees were found, relocate them to the expected
  // path (`addon/styles)
  if (dependencyStyleTree) {
    relocatedDependencyStyleTree = new Funnel(dependencyStyleTree, {
      allowEmpty: true,
      srcDir: 'app/styles',
      destDir: '/',
      annotation: 'Funnel: relocate app/styles for (' + this.name + ')',
    });
  }

  var combinedEngineStylesAndDependencyStylesTree = maybeMergeTrees(
    [relocatedDependencyStyleTree, engineStylesTree],
    { overwrite: true }
  );

  return this.debugTree(
    combinedEngineStylesAndDependencyStylesTree,
    'engine-style:input'
  );
});

module.exports = {
  extend: function(options) {
    var originalInit =
      options.init ||
      function() {
        this._super.init.apply(this, arguments);
      };

    options.cacheKeyForTree = function(treeType) {
      // We do different things in the addon, public, and engine trees based on
      // the value of `lazyLoading.enabled`, so we add it to the cache key
      if (
        treeType === 'addon' ||
        treeType === 'public' ||
        treeType === 'engine'
      ) {
        return calculateCacheKeyForTree(treeType, this, [this.lazyLoading]);
      } else {
        return calculateCacheKeyForTree(treeType, this);
      }
    };

    /**
     * Gets a map of all the addons that are used by all hosts above
     * the current host.
     *
     * The key is the name of the addon and the value is first encountered instance of this addon.
     */
    options.ancestorHostAddons = function() {
      if (this._hostAddons) {
        return this._hostAddons;
      }

      var host = findHostsHost.call(this);

      if (!host) {
        return {};
      }

      var hostIsEngine = !!host.ancestorHostAddons;

      var hostAddons = hostIsEngine
        ? Object.assign({}, host.ancestorHostAddons())
        : {};
      var queue = hostIsEngine
        ? host.addons.slice()
        : host.project.addons.slice();

      // Do a breadth-first walk of the addons in the host, ignoring those that
      // have a different host (e.g., lazy engine)
      while (queue.length) {
        var addon = queue.pop();

        if (addon.lazyLoading && addon.lazyLoading.enabled) {
          continue;
        }

        if (hostAddons[addon.name]) {
          continue;
        }

        hostAddons[addon.name] = addon;
        queue.push.apply(queue, addon.addons);
      }

      this._hostAddons = hostAddons;

      return hostAddons;
    };

    /**
     * Similar to eachAddonInvoke, except that it does not run the method for
     * addons that already appear in an ancestor host already. This prevents
     * duplicate inclusion of code by child lazy engines.
     */
    options.nonDuplicatedAddonInvoke = function(methodName, args) {
      this.initializeAddons();

      var invokeArguments = args || [];
      var hostAddons = this.ancestorHostAddons();

      return this.addons
        .map(function(addon) {
          if (!addon[methodName]) {
            // no method to call
            return;
          }
          var hostAddon = hostAddons[addon.name];
          if (hostAddon && hostAddon.cacheKeyForTree) {
            switch (methodName) {
              case 'treeFor':
                var treeName = invokeArguments[0];
                var hostAddonCacheKey = hostAddon.cacheKeyForTree(treeName);
                var addonCacheKey = addon.cacheKeyForTree(treeName);
                if (
                  addonCacheKey != null &&
                  addonCacheKey === hostAddonCacheKey
                ) {
                  // the addon specifies cache key and it is the same as host instance of the addon, skip the tree
                  return;
                }
                break;
              default:
                // the same addon exist in the parent as well, skip the invocation
                return;
            }
          }
          return addon[methodName].apply(addon, invokeArguments);
        })
        .filter(Boolean);
    };

    options.debugTree = BroccoliDebug.buildDebugCallback(
      'ember-engines:' + options.name
    );

    options._concatStyles =
      options._concatStyles ||
      function concatProcessedStyles(type, tree) {
        var engineStylesOutputDir = 'engines-dist/' + this.name + '/assets/';

        // Move styles tree into the correct place.
        // `**/*.css` all gets merged.
        return concat(tree, {
          allowNone: true,
          inputFiles: ['**/*.css'],
          outputFile: engineStylesOutputDir + type + '.css',
        });
      };

    options.init = function() {
      this.options = defaultsDeep(options, DEFAULT_CONFIG);

      // Ensure lazyLoading is a hash, retain backwards compatibility with using
      // a boolean value
      if (typeof this.lazyLoading === 'boolean') {
        this.lazyLoading = {
          enabled: this.lazyLoading,
        };
      }

      // NOTE: This is a beautiful hack to deal with core object calling toString on the function.
      // It'll throw a deprecation warning if this isn't present because it doesn't see a `_super`
      // invocation. Do not remove the following line!
      // this._super()

      var result = originalInit.apply(this, arguments);

      var useDeprecatedIncorrectCSSProcessing =
        this.useDeprecatedIncorrectCSSProcessing === true;
      if (useDeprecatedIncorrectCSSProcessing) {
        this.ui.writeDeprecateLine(
          this.pkg.name +
            ' engine has opted in to ember-engines@0.4 styles processing compatibility mode (via use of the `useDeprecatedIncorrectCSSProcessing` flag), this is deprecated and will be removed in future versions.'
        );
      }

      if (!this._addonPreprocessTree && this._addonPostprocessTree) {
        throw new Error(
          'ember-engines@0.5 requires ember-cli@2.12, please update your ember-cli version.'
        );
      }

      // Require that the user specify a lazyLoading property.
      if (!('lazyLoading' in this)) {
        this.ui.writeDeprecateLine(
          this.pkg.name +
            ' engine must specify the `lazyLoading.enabled` property as to whether the engine should be lazily loaded.'
        );
      }

      if (shouldCompactReexports(this)) {
        this.ui.writeDebugLine('Compacting re-exports');

        if (!this.options.babel.plugins) {
          this.options.babel.plugins = [];
        }

        this.options.babel.plugins.push(CompactReexports);
      } else {
        this.ui.writeDebugLine('Not compacting re-exports');
      }

      // Change the host inside of engines.
      // Support pre-2.7 Ember CLI.
      var originalFindHost = this._findHost || findRoot;

      // Unfortunately results in duplication, but c'est la vie.
      this._findHost = findHost;

      this.otherAssetPaths = [];
      this._scriptOutputFiles = {};
      this._styleOutputFiles = {};

      // Determines if this Engine or any of its parents are lazy
      this._hasLazyAncestor = findHost.call(this) !== findRoot.call(this);

      this._processedExternalTree = function() {
        return buildExternalTree.call(this);
      };

      this.import = function(asset, options) {
        var host = originalFindHost.call(this);
        var target = this._findHost();

        target.env = host.env;
        target._import = host._import;
        target._getAssetPath = host._getAssetPath;
        target.otherAssets = host.otherAssets;
        target._mergeTrees = host._mergeTrees;

        // We're delegating to the upstream EmberApp behavior for eager engines.
        if (this.lazyLoading.enabled !== true) {
          // Asset can be an object with environment properties.
          asset = target._getAssetPath(asset);

          // The asset path can be undefined depending on `env`.
          if (typeof asset !== 'string') {
            return;
          }

          // This is hard-coded in Ember CLI, not tied to treePaths.
          asset.replace(/^vendor/, '');
        }
        return host.import.call(target, asset, options);
      };

      var originalIncluded = this.included;
      this.included = function() {
        if (this.lazyLoading.enabled === true) {
          // Do this greedily so that it runs before the `included` hook.
          this.import('engines-dist/' + this.name + '/assets/engine-vendor.js');
          this.import(
            'engines-dist/' + this.name + '/assets/engine-vendor.css'
          );
        }

        /**
          ALERT! This changes the semantics of `app` inside of an engine.
          For maximum compatibility inside of the `included(app)` call we always
          supply the host application as `app`.

          If you _truly_ want your immediate parent you should access it via
          `this.parent`.
         */
        if (originalIncluded) {
          var ui = this.ui;
          var name = this.name;
          var host = originalFindHost.call(this);
          var originalHostImport = host.import;
          var customHost = Object.create(host);
          if (!process.env.SUPPRESS_APP_IMPORT_WARNING) {
            customHost.import = function() {
              var stack = new Error().stack;
              ui.writeWarnLine(
                '`app.import` should be avoided and `this.import` should be used instead. ' +
                  'Using `app.import` forces the asset in question to be hoisted in all scenarios (' +
                  'regardless of `lazyLoading.enabled` flag).\n\n  Import performed on `' +
                  name +
                  "`'s `app` argument at:\n\n  " +
                  stack +
                  '\n'
              );
              return originalHostImport.apply(this, arguments);
            };
          }
          originalIncluded.call(this, customHost);
        }

        this.nonDuplicatedAddonInvoke('included', [this]);
      };

      // The treeForEngine method constructs and returns a tree that represents
      // the engines routes.js file and its dependencies. This is used later to
      // promote the engines routes.js to the host.
      //
      // If the lazyLoading.includeRoutesInApplication option is false, we don't
      // want to promote the routes into the host.
      this.treeForEngine = function() {
        var extractRoutes =
          this._hasLazyAncestor &&
          this.lazyLoading.includeRoutesInApplication !== false;
        if (!extractRoutes) {
          return;
        }

        // The only thing that we want to promote from a lazy engine is the
        // routes.js file and all of its dependencies, which is why we build the
        // complete JS tree.
        var completeJSTree = buildCompleteJSTree.call(this);

        // Splice out the routes.js file and its dependencies.
        // We will push these into the host application.
        var engineRoutesTree = new DependencyFunnel(completeJSTree, {
          include: true,
          entry: this.name + '/routes.js',
          external: ['ember-engines/routes'],
        });

        // They need to be in the modules directory for later processing.
        return engineRoutesTree;
      };

      // Replace `treeForAddon` so that we control how this engine gets built.
      // We may or may not want it to be combined like a default addon.
      this.treeForAddon = function() {
        if (this.lazyLoading.enabled === true) {
          return;
        }

        // NOT LAZY LOADING!
        // This is the scenario where we want to act like an addon.
        var engineCSSTree = buildEngineStyleTree.call(this);

        if (useDeprecatedIncorrectCSSProcessing) {
          engineCSSTree = this._treeFor('addon-styles');
        }

        var compiledEngineCSSTree = this.debugTree(
          this.compileStyles(engineCSSTree),
          'styles'
        );

        // If any of this engine's ancestors are lazy we need to
        // remove the engine's routes file, because we've already accounted
        // for our route map file with the `treeForEngine` hook.
        var engineJSTree = this._hasLazyAncestor
          ? buildEngineJSTreeWithoutRoutes.call(this)
          : buildEngineJSTree.call(this);

        // Move the Engine tree to `modules`
        engineJSTree = new Funnel(engineJSTree, {
          destDir: 'modules',
        });

        // We only calculate our external tree for eager engines
        // if they're going to be consumed by a lazy engine.
        var externalTree;
        var hostLazyLoading = this._findHost().lazyLoading;
        if (hostLazyLoading && hostLazyLoading.enabled === true) {
          externalTree = buildExternalTree.call(this);
        }

        return mergeTrees(
          [externalTree, engineJSTree, compiledEngineCSSTree].filter(Boolean),
          { overwrite: true }
        );
      };

      this.compileLazyEngineStyles = function compileLazyEngineStyles(
        vendorTree,
        externalTree
      ) {
        var vendorCSSTree = buildVendorCSSTree.call(this, vendorTree);
        var engineStylesOutputDir = 'engines-dist/' + this.name + '/assets/';

        // if the user specified `minifyCSS.enabled` at all, use their value
        // otherwise default to `true` when in production
        let shouldMinifyCSS =
          'enabled' in this.options.minifyCSS
            ? this.options.minifyCSS.enabled
            : process.env.EMBER_ENV === 'production';
        let minificationOptions = this.options.minifyCSS.options || {};
        minificationOptions.registry = this.registry;

        // get engines own addon-styles tree
        var engineStylesTree = buildEngineStyleTree.call(this);

        if (useDeprecatedIncorrectCSSProcessing) {
          engineStylesTree = this._treeFor('addon-styles');
        }

        var primaryStyleTree = null;
        if (engineStylesTree) {
          var preprocessedEngineStylesTree = this._addonPreprocessTree(
            'css',
            engineStylesTree
          );

          var processedEngineStylesTree = preprocessCss(
            preprocessedEngineStylesTree,
            /* inputPath */ '/',
            /* outputPath */ '/',
            {
              outputPaths: { addon: engineStylesOutputDir + 'engine.css' },
              registry: this.registry,
            }
          );

          processedEngineStylesTree = this.debugTree(
            processedEngineStylesTree,
            'engine-style:postprocessed'
          );

          primaryStyleTree = this._concatStyles(
            'engine',
            processedEngineStylesTree
          );

          primaryStyleTree = this.debugTree(
            primaryStyleTree,
            'engine-style:post-concat'
          );

          if (shouldMinifyCSS) {
            primaryStyleTree = preprocessMinifyCss(
              primaryStyleTree,
              minificationOptions
            );
          }

          primaryStyleTree = this.debugTree(
            primaryStyleTree,
            'engine-style:output'
          );
        }

        var concatVendorCSSTree = this._concatStyles(
          'engine-vendor',
          vendorCSSTree
        );

        concatVendorCSSTree = this.debugTree(
          concatVendorCSSTree,
          'vendor-style:pre-import'
        );

        var concatMergedVendorCSSTree = mergeTrees([
          concatVendorCSSTree,
          externalTree,
        ]);

        // So, this is weird, but imports are processed in order.
        // This gives the chance for somebody to prepend onto the vendor files.
        var vendorCSSImportTree = buildVendorCSSWithImports.call(
          this,
          concatMergedVendorCSSTree
        );

        if (shouldMinifyCSS) {
          vendorCSSImportTree = preprocessMinifyCss(
            vendorCSSImportTree,
            minificationOptions
          );
        }

        var mergedVendorCSSWithImportAndEngineStylesTree = mergeTrees(
          [vendorCSSImportTree, primaryStyleTree].filter(Boolean),
          { overwrite: true }
        );

        var combinedProcessedStylesTree = new Funnel(
          mergedVendorCSSWithImportAndEngineStylesTree,
          {
            srcDir: 'engines-dist/',
            destDir: 'engines-dist/',
          }
        );

        // run post processing via the `postprocessTree` hook on the final output
        var finalStylesTree = this._addonPostprocessTree(
          'css',
          combinedProcessedStylesTree
        );

        return this.debugTree(finalStylesTree, 'styles');
      };

      // We want to do the default `treeForPublic` behavior if we're not a lazy loading engine.
      // If we are a lazy loading engine we now have to manually do the compilation steps for the engine.
      // Luckily the public folder gets merged into the right place in the final output.
      // We'll take advantage of that.
      var originalTreeForPublic = this.treeForPublic;
      this.treeForPublic = function() {
        // NOT LAZY LOADING!
        // In this scenario we just want to do the default behavior and bail.
        if (this.lazyLoading.enabled !== true) {
          return originalTreeForPublic.apply(this, arguments);
        }

        // LAZY LOADING!
        // But we have to implement everything manually for the lazy loading scenario.

        var vendorTree = buildVendorTree.call(this);
        var vendorJSTree = buildVendorJSTree.call(this, vendorTree);
        var externalTree = new Funnel(vendorTree, {
          srcDir: 'vendor',
          destDir: 'vendor',
          allowEmpty: true,
        });

        var finalStylesTree = this.compileLazyEngineStyles(
          vendorTree,
          externalTree
        );

        // Move the public tree. It is already all in a folder named `this.name`
        var publicResult = originalTreeForPublic.apply(this, arguments);
        var publicRelocated;
        if (publicResult) {
          publicRelocated = new Funnel(publicResult, {
            destDir: 'engines-dist',
          });
        }

        // Get the child addons public trees.
        // Sometimes this will be an engine tree in which case we need to handle it differently.
        var childAddonsPublicTrees = this.nonDuplicatedAddonInvoke('treeFor', [
          'public',
        ]);
        var childAddonsPublicTreesMerged = mergeTrees(childAddonsPublicTrees, {
          overwrite: true,
        });
        var childLazyEngines = new Funnel(childAddonsPublicTreesMerged, {
          srcDir: 'engines-dist',
          destDir: 'engines-dist',
          allowEmpty: true,
        });
        var childAddonsPublicTreesRelocated = new Funnel(
          childAddonsPublicTreesMerged,
          {
            exclude: ['engines-dist', 'engines-dist/**/*.*'],
            destDir: 'engines-dist/' + this.name,
          }
        );
        var addonsEnginesPublicTreesMerged = mergeTrees(
          [childLazyEngines, childAddonsPublicTreesRelocated],
          { overwrite: true }
        );

        var engineJSTree = buildEngineJSTreeWithoutRoutes.call(this);

        // If babel options aren't defined, we need to transpile the modules.
        if (!this.options || !this.options.babel) {
          engineJSTree = processBabel(engineJSTree);
          vendorJSTree = processBabel(vendorJSTree);
        }

        // Concatenate all of the engine's JavaScript into a single file.
        var concatEngineTree = concat(engineJSTree, {
          allowNone: true,
          inputFiles: ['**/*.js'],
          outputFile: 'engines-dist/' + this.name + '/assets/engine.js',
        });

        // Concatenate all of the engine's "vendor" trees
        var concatVendorJSTree = concat(vendorJSTree, {
          allowNone: true,
          inputFiles: ['**/*.js'],
          outputFile: 'engines-dist/' + this.name + '/assets/engine-vendor.js',
        });

        var concatMergedVendorJSTree = mergeTrees([
          concatVendorJSTree,
          externalTree,
        ]);

        // So, this is weird, but imports are processed in order.
        // This gives the chance for somebody to prepend onto the vendor files.
        var vendorJSImportTree = buildVendorJSWithImports.call(
          this,
          concatMergedVendorJSTree
        );

        var otherAssets;
        if (this.otherAssets) {
          otherAssets = this.otherAssets();
        }

        var configTemplatePath = path.join(__dirname, '/engine-config-node-module.js');
        var configTemplate = fs.readFileSync(configTemplatePath, { encoding: 'utf8' });

        var configEnvironment = writeFile(
          'engines-dist/' + options.name + '/config/environment.js',
          configTemplate
            .replace('{{MODULE_PREFIX}}', options.name)
            .replace('{{CONFIG}}', JSON.stringify(this.engineConfig()))
        );

        // Merge all of our final trees!
        var finalMergeTrees = [
          configEnvironment,
          publicRelocated,
          addonsEnginesPublicTreesMerged,
          otherAssets,
          finalStylesTree,
          vendorJSImportTree,
          concatEngineTree,
        ];

        // Separate engines routes from the host if includeRoutesInApplication
        // is false
        var separateRoutes =
          this.lazyLoading.includeRoutesInApplication === false;
        if (separateRoutes) {
          var engineRoutesTree = buildEngineRoutesJSTree.call(this);
          finalMergeTrees.push(engineRoutesTree);
        }

        return mergeTrees(finalMergeTrees.filter(Boolean), {
          overwrite: true,
        });
      };

      return result;
    };

    /**
      Returns configuration settings that will augment the application's
      configuration settings.

      By default, engines return `null`, and maintain their own separate
      configuration settings which are retrieved via `engineConfig()`.

      @public
      @method config
      @param {String} env Name of current environment (e.g. "developement")
      @param {Object} baseConfig Initial application configuration
      @return {Object} Configuration object to be merged with application configuration.
    */
    options.config =
      options.config ||
      function() {
        return null;
      };

    /**
      Returns an engine's configuration settings, to be used exclusively by the
      engine.

      By default, this method simply reads the configuration settings from
      an engine's `config/environment.js`.

      @public
      @method engineConfig
      @param {String} env Name of current environment (e.g. "developement")
      @param {Object} baseConfig Initial engine configuration
      @return {Object} Configuration object that will be provided to the engine.
    */
    options.engineConfig = function(env, baseConfig) {
      if (this._engineConfig) {
        return this._engineConfig;
      }

      var configPath = 'config';

      if (
        this.pkg['ember-addon'] &&
        this.pkg['ember-addon']['engineConfigPath']
      ) {
        configPath = this.pkg['ember-addon']['engineConfigPath'];
      }

      configPath = path.join(this.root, configPath, 'environment.js');

      if (fs.existsSync(configPath)) {
        var configGenerator = require(configPath);

        var engineConfig = configGenerator(env, baseConfig);

        var addonsConfig = this.getAddonsConfig(env, engineConfig);

        return this._engineConfig = merge(addonsConfig, engineConfig);
      } else {
        return this._engineConfig = this.getAddonsConfig(env, {});
      }
    };

    /**
      Returns the addons' configuration.

      @private
      @method getAddonsConfig
      @param  {String} env           Environment name
      @param  {Object} engineConfig  Engine configuration
      @return {Object}               Merged configuration of all addons
     */
    options.getAddonsConfig = function(env, engineConfig) {
      this.initializeAddons();

      var initialConfig = merge({}, engineConfig);

      return this.addons.reduce(function(config, addon) {
        if (addon.config) {
          merge(config, addon.config(env, config));
        }

        return config;
      }, initialConfig);
    };

    /**
      Overrides the content provided for the `head` section to include
      the engine's configuration settings as a meta tag.

      @public
      @method contentFor
      @param type
      @param config
    */
    options.contentFor = function(type, config) {
      if (type === 'head') {
        var engineConfig = this.engineConfig(config.environment, {});

        var content =
          '<meta name="' +
          options.name +
          '/config/environment" ' +
          'content="' +
          escape(JSON.stringify(engineConfig)) +
          '" />';

        return content;
      }

      return '';
    };

    /**
     * When using ember-cli-fastboot, this will ensure a lazy Engine's assets
     * are loaded into the FastBoot sandbox.
     *
     * @override
     */
    options.updateFastBootManifest = function(manifest) {
      if (this.lazyLoading.enabled) {
        manifest.vendorFiles.push('engines-dist/' + options.name + '/assets/engine-vendor.js');
        manifest.vendorFiles.push('engines-dist/' + options.name + '/assets/engine.js');
        manifest.vendorFiles.push('engines-dist/' + options.name + '/config/environment.js');
      }

      return manifest;
    };

    /**
      Returns the contents of the module to be used for accessing the Engine's
      config.

      @public
      @method getEngineConfigContents
      @return {String}
    */
    options.getEngineConfigContents =
      options.getEngineConfigContents ||
      function() {
        var configTemplatePath = path.join(
          __dirname,
          '/engine-config-from-meta.js'
        );
        var configTemplate = fs.readFileSync(configTemplatePath, {
          encoding: 'utf8',
        });
        return configTemplate.replace('{{MODULE_PREFIX}}', options.name);
      };

    /**
      Returns the appropriate set of trees for this engine's child addons
      given a type of tree. It will merge these trees (if present) with the
      engine's tree of the same name.

      @public
      @method treeFor
      @param {String} name
      @return {Tree}
    */
    options.treeFor = function treeFor(name, source) {
      this._requireBuildPackages();

      var cacheKey;
      if (HAS_TREE_CACHE) {
        cacheKey = this.cacheKeyForTree(name);
        var cachedTree = Addon._treeCache.getItem(cacheKey);
        if (cachedTree) {
          return cachedTree;
        }
      }

      /**
        Scenarios where we don't want to call `eachAddonInvoke`:
        - app tree.
        - addon tree of a lazy engine.
        - public tree of a lazy engine.

        We handle these cases manually inside of treeForPublic.
        This is to consolidate child dependencies of this engine
        into the engine namespace as opposed to shoving them into
        the host application's vendor.js file.
       */

      var trees;
      if (
        name === 'app' ||
        // when using deprecated 0.4 style processing, we allow the styles tree to be
        // hoisted to the top level host
        (this.useDeprecatedIncorrectCSSProcessing !== true &&
          name === 'styles') ||
        (name === 'addon' && this.lazyLoading.enabled === true) ||
        (name === 'public' && this.lazyLoading.enabled === true)
      ) {
        trees = [];
      } else {
        trees = this.eachAddonInvoke('treeFor', [name]);
      }

      if (name === 'addon' && source !== 'buildVendorTree') {
        trees = trees.concat(this.eachAddonInvoke('treeForEngine', [this]));
        trees.push(this.treeForEngine());
      }

      // The rest of this is the default implementation of `treeFor`.

      var tree = this._treeFor(name);

      if (tree) {
        trees.push(tree);
      }

      if (this.isDevelopingAddon() && this.hintingEnabled() && name === 'app') {
        trees.push(this.jshintAddonTree());
      }

      var mergedTree = mergeTrees(trees.filter(Boolean), {
        overwrite: true,
        annotation: 'Engine#treeFor (' + options.name + ' - ' + name + ')',
      });

      if (HAS_TREE_CACHE) {
        Addon._treeCache.setItem(cacheKey, mergedTree);
      }

      return mergedTree;
    };
    return options;
  },
};
