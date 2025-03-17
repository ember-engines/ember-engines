/* eslint-disable n/no-unpublished-require */
'use strict';

const Funnel = require('broccoli-funnel');
const merge = require('lodash/merge');
const mergeTrees = require('ember-cli/lib/broccoli/merge-trees');
const fs = require('fs');
const path = require('path');
const writeFile = require('broccoli-file-creator');
const concat = require('broccoli-concat');
const DependencyFunnel = require('broccoli-dependency-funnel');
const defaultsDeep = require('lodash/defaultsDeep');
const calculateCacheKeyForTree = require('calculate-cache-key-for-tree');
const Addon = require('ember-cli/lib/models/addon');
const { memoize } = require('./utils/memoize');
const maybeMergeTrees = require('./utils/maybe-merge-trees');
const deeplyNonDuplicatedAddon = require('./utils/deeply-non-duplicated-addon');
const restoreOriginalAddons = require('./utils/restore-original-addons');
const p = require('ember-cli-preprocess-registry/preprocessors');
const shouldCompactReexports = require('./utils/should-compact-reexports');
const appendCompactReexportsIfNeeded = require('./utils/append-compact-reexports-if-needed');
const ensureLazyLoadingHash = require('./utils/ensure-lazy-loading-hash');
const { findLCAHost } = require('./utils/find-lca-host');
const preprocessCss = p.preprocessCss;
const BroccoliDebug = require('broccoli-debug');

const preprocessMinifyCss = function (tree, options) {
  /**
   * For ember-cli < 5.0.0, end users may not have `ember-cli-clean-css` or alternatives installed
   * since ember-cli-preprocess-registry by default included `broccoli-clean-css` as a fallback.
   *
   * To support css minification for this case, if there is no existing minify-css plugin in the registry,
   * we will attempt to use `broccoli-clean-css` as a fallback.
   *
   * When ember-engine drops support for ember-cli < 5.0.0, this fallback can be removed.
   */
  if (options.registry.load('minify-css').length === 0) {
    try {
      /* eslint-disable n/no-missing-require */
      var CleanCSS = require('broccoli-clean-css');
      return new CleanCSS(tree, options);
    } catch (e) {
      // noop
    }
  }

  return p.preprocessMinifyCss.apply(p, arguments);
};

// Older versions of Ember-CLI may not have the Addon's tree cache
const HAS_TREE_CACHE = !!Addon._treeCache;
const EOL = require('os').EOL;
const DEFAULT_CONFIG = {
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

const findRoot = require('./utils/find-root');
const findHost = require('./utils/find-host');
const processBabel = require('./utils/process-babel');

// support addon bundle caching; we need to use the `TARGET_INSTANCE`
// symbol to access the real addon when computing `ancestorHostAddons`
// for more information, see the original PR in `ember-cli` adding this
// optimization: https://github.com/ember-cli/ember-cli/pull/9487
let TARGET_INSTANCE_SYMBOL = null;

try {
  const targetInstanceModule = require('ember-cli/lib/models/per-bundle-addon-cache/target-instance');

  if (targetInstanceModule) {
    TARGET_INSTANCE_SYMBOL = targetInstanceModule.TARGET_INSTANCE;
  }
} catch (e) {
  // we only want to handle the error when this module isn't found; i.e.,
  // when a consumer of `ember-engines` is using an old version of `ember-cli`
  // (less than `ember-cli` 3.28)
  if (!e || e.code !== 'MODULE_NOT_FOUND') {
    throw e;
  }
}

const buildExternalTree = memoize(function buildExternalTree() {
  const treePath = this.treePaths['vendor'];
  const vendorPath = treePath ? path.resolve(this.root, treePath) : null;
  let trees = [];

  if (vendorPath && fs.existsSync(vendorPath)) {
    trees.push(
      new Funnel(vendorPath, {
        destDir: 'vendor',
      }),
    );
  }

  let nodeModulesTrees = Array.from(
    this._nodeModules.values(),
    (module) =>
      new Funnel(module.path, {
        srcDir: '/',
        destDir: `node_modules/${module.name}/`,
        annotation: `Funnel (node_modules/${module.name})`,
      }),
  );

  trees = trees.concat(...nodeModulesTrees);

  let externalTree = mergeTrees(trees, {
    annotation: 'TreeMerger (ExternalTree)',
    overwrite: true,
  });

  for (let customTransformEntry of this._customTransformsMap) {
    let transformName = customTransformEntry[0];
    let transformConfig = customTransformEntry[1];

    let transformTree = new Funnel(externalTree, {
      files: transformConfig.files,
      annotation: `Funnel (custom transform: ${transformName})`,
    });

    externalTree = mergeTrees(
      [
        externalTree,
        transformConfig.callback(transformTree, transformConfig.options),
      ],
      {
        annotation: `TreeMerger (custom transform: ${transformName})`,
        overwrite: true,
      },
    );
  }

  return externalTree;
});

const buildVendorTree = memoize(function buildVendorTree() {
  // Manually invoke the child addons addon trees.
  let childAddonsAddonTrees = this.nonDuplicatedAddonInvoke('treeFor', [
    'addon',
    'buildVendorTree',
  ]);
  let childAddonsAddonTreesMerged = mergeTrees(childAddonsAddonTrees, {
    overwrite: true,
  });

  return childAddonsAddonTreesMerged;
});

const buildVendorJSTree = memoize(function buildVendorJSTree(vendorTree) {
  // Filter out the JS so that we can process it correctly.
  let vendorJSTree = new Funnel(vendorTree, {
    include: ['**/*.js'],
    exclude: ['vendor/**/*.*'],
  });

  return vendorJSTree;
});

const buildVendorCSSTree = memoize(function buildVendorCSSTree(vendorTree) {
  // Filter out the CSS so that we can process it correctly.
  let vendorCSSTree = new Funnel(vendorTree, {
    include: ['**/*.css'],
    exclude: ['vendor/**/*.*'],
  });

  return this.debugTree(vendorCSSTree, 'vendor-style:input');
});

const buildEngineJSTree = memoize(function buildEngineJSTree() {
  let engineSourceTree;
  let treePath;
  let addonTree = this.options.trees.addon;

  if (typeof addonTree === 'string') {
    treePath = path.resolve(this.root, addonTree);
  }

  if (treePath && fs.existsSync(treePath)) {
    engineSourceTree = this.treeGenerator(treePath);
  } else {
    engineSourceTree = addonTree;
  }

  // We want the config and child app trees to be compiled with the engine source
  let configTree = writeFile(
    'config/environment.js',
    this.getEngineConfigContents(),
  );

  // This is an extraction of what would normally be run by the `treeFor` hook.
  let childAppTree = mergeTrees(this.eachAddonInvoke('treeFor', ['app']), {
    overwrite: true,
  });

  let augmentedEngineTree = mergeTrees(
    [configTree, childAppTree, engineSourceTree].filter(Boolean),
    { overwrite: true },
  );
  let engineTree = this.compileAddon(augmentedEngineTree);

  return engineTree;
});

const buildEngineJSTreeWithoutRoutes = memoize(
  function buildEngineJSTreeWithoutRoutes() {
    return new DependencyFunnel(buildEngineJSTree.call(this), {
      exclude: true,
      entry: this.name + '/routes.js',
      external: ['ember-engines/routes'],
    });
  },
);

const buildEngineRoutesJSTree = memoize(
  function buildEngineRouteJSTree(sourceMapConfig) {
    // Get complete engine JS tree
    let engineAppTree = buildEngineJSTree.call(this);

    // Separate routes
    let engineRoutesTree = new DependencyFunnel(engineAppTree, {
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
      sourceMapConfig,
    });

    // Return concatenated JS tree
    return this.debugTree(engineRoutesTree, 'routes:output');
  },
);

const buildVendorJSWithImports = memoize(
  function buildVendorJSTreeWithImports(
    concatTranspiledVendorJSTree,
    sourceMapConfig,
  ) {
    let externalTree = buildExternalTree.call(this);
    let combined = mergeTrees(
      [externalTree, concatTranspiledVendorJSTree].filter(Boolean),
      { overwrite: true },
    );

    let vendorFiles = [];
    for (let outputFile in this._scriptOutputFiles) {
      let inputFiles = this._scriptOutputFiles[outputFile];

      vendorFiles.push(
        concat(combined, {
          allowNone: true,
          annotation: 'Concat: Vendor ' + outputFile,
          headerFiles: inputFiles,
          outputFile: 'engines-dist/' + this.name + outputFile,
          separator: EOL + ';',
          sourceMapConfig,
        }),
      );
    }

    return mergeTrees(vendorFiles, { overwrite: true });
  },
);

const buildVendorCSSWithImports = memoize(
  function buildVendorCSSWithImports(concatVendorCSSTree, sourceMapConfig) {
    let externalTree = buildExternalTree.call(this);
    let combined = mergeTrees(
      [externalTree, concatVendorCSSTree].filter(Boolean),
      { overwrite: true },
    );

    let vendorFiles = [];
    for (let outputFile in this._styleOutputFiles) {
      let inputFiles = this._styleOutputFiles[outputFile];

      vendorFiles.push(
        concat(combined, {
          allowNone: true,
          annotation: 'Concat: Vendor ' + outputFile,
          inputFiles: inputFiles,
          outputFile: 'engines-dist/' + this.name + outputFile,
          sourceMapConfig,
        }),
      );
    }

    return mergeTrees(vendorFiles, { overwrite: true });
  },
);

const buildCompleteJSTree = memoize(function buildCompleteJSTree() {
  let vendorTree = buildVendorTree.call(this);
  let vendorJSTree = buildVendorJSTree.call(this, vendorTree);
  let engineAppTree = buildEngineJSTree.call(this);

  return mergeTrees([vendorJSTree, engineAppTree], { overwrite: true });
});

const buildEngineStyleTree = memoize(function buildEngineStyleTree() {
  // gather engines own `addon/styles` and its dependencies `app/styles`
  let engineStylesTree = this._treeFor('addon-styles');
  let dependencyStyleTrees = this.nonDuplicatedAddonInvoke('treeFor', [
    'styles',
  ]);
  let dependencyStyleTree = maybeMergeTrees(dependencyStyleTrees, {
    overwrite: true,
  });
  let relocatedDependencyStyleTree;

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

  let combinedEngineStylesAndDependencyStylesTree = maybeMergeTrees(
    [relocatedDependencyStyleTree, engineStylesTree],
    { overwrite: true },
  );

  return this.debugTree(
    combinedEngineStylesAndDependencyStylesTree,
    'engine-style:input',
  );
});

function buildEngine(options) {
  let originalInit =
    options.init ||
    function () {
      this._super.init.apply(this, arguments);
    };

  options.cacheKeyForTree = function (treeType) {
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
   */
  options.ancestorHostAddons = function () {
    if (this._hostAddons) {
      return this._hostAddons;
    }

    let host = findLCAHost(this);

    if (!host) {
      return {};
    }

    let hostIsEngine = !!host.ancestorHostAddons;

    let hostAddons = hostIsEngine
      ? Object.assign({}, host.ancestorHostAddons())
      : {};
    let queue = hostIsEngine
      ? host.addons.slice()
      : host.project.addons.slice();

    // Do a breadth-first walk of the addons in the host, ignoring those that
    // have a different host (e.g., lazy engine)
    while (queue.length) {
      let addon = queue.pop();

      if (addon.lazyLoading && addon.lazyLoading.enabled) {
        continue;
      }

      if (hostAddons[addon.name]) {
        continue;
      }

      hostAddons[addon.name] = addon;

      let addons =
        TARGET_INSTANCE_SYMBOL && addon[TARGET_INSTANCE_SYMBOL]
          ? addon[TARGET_INSTANCE_SYMBOL].addons
          : addon.addons;

      queue.push(...addons);
    }

    this._hostAddons = hostAddons;

    return hostAddons;
  };

  /**
   * Similar to eachAddonInvoke, except that it does not run the method for
   * addons that already appear in an ancestor host already. This prevents
   * duplicate inclusion of code by child lazy engines.
   */
  options.nonDuplicatedAddonInvoke = function (methodName, args) {
    this.initializeAddons();

    let invokeArguments = args || [];
    let hostAddons = this.ancestorHostAddons();
    let treeName = invokeArguments[0];

    // methodName could be "treeFor" or "included"
    // the "included" methodName will be handled in the old implementation for now
    // TODO: when deeplyNonDuplicatedAddon is completely ready
    // make sure that the "included" methodName is considered
    if (process.env.EMBER_ENGINES_ADDON_DEDUPE && methodName === 'treeFor') {
      let trees;

      try {
        deeplyNonDuplicatedAddon(hostAddons, this, treeName);

        trees = this.addons
          .filter((addon) => {
            if (!addon[methodName]) {
              // no method to call
              return false;
            }
            return true;
          })
          .map((addon) => {
            return addon[methodName].apply(addon, invokeArguments);
          });
      } finally {
        restoreOriginalAddons(this);
      }

      return trees;
    }

    // old implementation
    return this.addons
      .map((addon) => {
        if (!addon[methodName]) {
          // no method to call
          return;
        }

        let hostAddon = hostAddons[addon.name];

        if (hostAddon && hostAddon.cacheKeyForTree) {
          if (methodName === 'treeFor') {
            let hostAddonCacheKey = hostAddon.cacheKeyForTree(treeName);
            let addonCacheKey = addon.cacheKeyForTree(treeName);

            if (addonCacheKey != null && addonCacheKey === hostAddonCacheKey) {
              // the addon specifies cache key and it is the same as host instance of the addon, skip the tree
              return;
            }
          } else {
            return;
          }
        }

        return addon[methodName].apply(addon, invokeArguments);
      })
      .filter(Boolean);
  };

  options.debugTree = BroccoliDebug.buildDebugCallback(
    'ember-engines:' + options.name,
  );

  options._concatStyles =
    options._concatStyles ||
    function concatProcessedStyles(type, tree, sourceMapConfig) {
      let engineStylesOutputDir = 'engines-dist/' + this.name + '/assets/';

      // Move styles tree into the correct place.
      // `**/*.css` all gets merged.
      return concat(tree, {
        allowNone: true,
        inputFiles: ['**/*.css'],
        outputFile: engineStylesOutputDir + type + '.css',
        sourceMapConfig,
      });
    };

  options.init = function () {
    this._engineConfig = new Map();
    this.options = defaultsDeep(options, DEFAULT_CONFIG);

    ensureLazyLoadingHash(this);

    // NOTE: This is a beautiful hack to deal with core object calling toString on the function.
    // It'll throw a deprecation warning if this isn't present because it doesn't see a `_super`
    // invocation. Do not remove the following line!
    // this._super()

    let result = originalInit.apply(this, arguments);

    if (!this._addonPreprocessTree && this._addonPostprocessTree) {
      throw new Error(
        'ember-engines@0.5 requires ember-cli@2.12, please update your ember-cli version.',
      );
    }

    ['ember-addon', 'ember-engine'].forEach((keyword) => {
      if (!this.pkg.keywords || this.pkg.keywords.indexOf(keyword) === -1) {
        this.ui.writeWarnLine(
          this.pkg.name +
            ` engine must specify "${keyword}" in the keywords section on package.json`,
        );
      }
    });

    // Require that the user specify a lazyLoading property.
    if (!('lazyLoading' in this)) {
      this.ui.writeDeprecateLine(
        this.pkg.name +
          ' engine must specify the `lazyLoading.enabled` property as to whether the engine should be lazily loaded.',
      );
    }

    if (shouldCompactReexports(this, options)) {
      this.ui.writeDebugLine('Compacting re-exports');

      if (!this.options.babel.plugins) {
        this.options.babel.plugins = [];
      }

      appendCompactReexportsIfNeeded(this.options.babel.plugins);
    } else {
      this.ui.writeDebugLine('Not compacting re-exports');
    }

    // Change the host inside of engines.
    // Support pre-2.7 Ember CLI.
    let originalFindHost = this._findHost || findRoot;

    // Unfortunately results in duplication, but c'est la vie.
    this._findHost = findHost;

    this.otherAssetPaths = [];
    this._scriptOutputFiles = {};
    this._styleOutputFiles = {};
    this._nodeModules = new Map();
    this._customTransformsMap = new Map();
    this.shouldIncludeAddon = () => true;

    // Determines if this Engine or any of its parents are lazy
    this._hasLazyAncestor = findHost.call(this) !== findRoot.call(this);

    this._processedExternalTree = function () {
      return buildExternalTree.call(this);
    };

    this.import = function (asset, options) {
      let host = originalFindHost.call(this);
      let target = this._findHost();

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

    let originalIncluded = this.included;
    this.included = function () {
      if (this.lazyLoading.enabled === true) {
        // Do this greedily so that it runs before the `included` hook.
        this.import('engines-dist/' + this.name + '/assets/engine-vendor.js');
        this.import('engines-dist/' + this.name + '/assets/engine-vendor.css');

        let host = originalFindHost.call(this);
        host._importAddonTransforms.call(this);
      }

      /**
        ALERT! This changes the semantics of `app` inside of an engine.
        For maximum compatibility inside of the `included(app)` call we always
        supply the host application as `app`.

        If you _truly_ want your immediate parent you should access it via
        `this.parent`.
        */
      if (originalIncluded) {
        let ui = this.ui;
        let name = this.name;
        let host = originalFindHost.call(this);
        let originalHostImport = host.import;
        let customHost = Object.create(host);
        if (!process.env.SUPPRESS_APP_IMPORT_WARNING) {
          customHost.import = function () {
            let stack = new Error().stack;
            ui.writeWarnLine(
              '`app.import` should be avoided and `this.import` should be used instead. ' +
                'Using `app.import` forces the asset in question to be hoisted in all scenarios (' +
                'regardless of `lazyLoading.enabled` flag).\n\n  Import performed on `' +
                name +
                "`'s `app` argument at:\n\n  " +
                stack +
                '\n',
            );
            return originalHostImport.apply(this, arguments);
          };
        }
        originalIncluded.call(this, customHost);
      } else {
        // If an `originalIncluded` is present, we assume that it eventually 
        // delegates to ember-cli's base implementation of `Addon#included()`,
        // which already calls `included()` for every child addon instance.
        // As such, we must only call `included()` manually, if there's no
        // `originalIncluded`, which would have already done that.
        // Otherwise, we would be calling `included()` twice, which leads to
        // bugs.
        // https://github.com/ember-engines/ember-engines/issues/405
        this.nonDuplicatedAddonInvoke('included', [this]);
      }
    };

    // The treeForEngine method constructs and returns a tree that represents
    // the engines routes.js file and its dependencies. This is used later to
    // promote the engines routes.js to the host.
    //
    // If the lazyLoading.includeRoutesInApplication option is false, we don't
    // want to promote the routes into the host.
    this.treeForEngine = function () {
      let extractRoutes =
        this._hasLazyAncestor &&
        this.lazyLoading.includeRoutesInApplication !== false;
      if (!extractRoutes) {
        return;
      }

      // The only thing that we want to promote from a lazy engine is the
      // routes.js file and all of its dependencies, which is why we build the
      // complete JS tree.
      let completeJSTree = buildCompleteJSTree.call(this);

      // Splice out the routes.js file and its dependencies.
      // We will push these into the host application.
      let engineRoutesTree = new DependencyFunnel(completeJSTree, {
        include: true,
        entry: this.name + '/routes.js',
        external: ['ember-engines/routes'],
      });

      // They need to be in the modules directory for later processing.
      return engineRoutesTree;
    };

    // Replace `treeForApp` so no engine files leak into app namespace
    // This prevents accidental usage of engine components/helpers/utilities
    // inside of a host app
    this.treeForApp = function () {};

    // Replace `treeForAddon` so that we control how this engine gets built.
    // We may or may not want it to be combined like a default addon.
    this.treeForAddon = function () {
      if (this.lazyLoading.enabled === true) {
        return;
      }

      // NOT LAZY LOADING!
      // This is the scenario where we want to act like an addon.
      let engineCSSTree = buildEngineStyleTree.call(this);

      let compiledEngineCSSTree = this.debugTree(
        this.compileStyles(engineCSSTree),
        'styles',
      );

      // If any of this engine's ancestors are lazy we need to
      // remove the engine's routes file, because we've already accounted
      // for our route map file with the `treeForEngine` hook.
      let engineJSTree = this._hasLazyAncestor
        ? buildEngineJSTreeWithoutRoutes.call(this)
        : buildEngineJSTree.call(this);

      // Move the Engine tree to `modules`
      engineJSTree = new Funnel(engineJSTree, {
        destDir: 'modules',
      });

      // We only calculate our external tree for eager engines
      // if they're going to be consumed by a lazy engine.
      let externalTree;
      let hostLazyLoading = this._findHost().lazyLoading;
      if (hostLazyLoading && hostLazyLoading.enabled === true) {
        externalTree = buildExternalTree.call(this);
      }

      return mergeTrees(
        [externalTree, engineJSTree, compiledEngineCSSTree].filter(Boolean),
        { overwrite: true },
      );
    };

    this.compileLazyEngineStyles = function compileLazyEngineStyles(
      vendorTree,
      externalTree,
    ) {
      let vendorCSSTree = buildVendorCSSTree.call(this, vendorTree);
      let engineStylesOutputDir = 'engines-dist/' + this.name + '/assets/';

      let hostOptions = findLCAHost(this).options || {};
      let sourceMapConfig = hostOptions.sourcemaps;

      // if the user specified `minifyCSS.enabled` at all, use their value
      // otherwise default to `true` when in production
      let shouldMinifyCSS =
        'enabled' in this.options.minifyCSS
          ? this.options.minifyCSS.enabled
          : process.env.EMBER_ENV === 'production';
      let minificationOptions = this.options.minifyCSS.options || {};
      minificationOptions.registry =
        findLCAHost(this)?.registry || this.registry;

      // get engines own addon-styles tree
      let engineStylesTree = buildEngineStyleTree.call(this);

      let primaryStyleTree = null;
      if (engineStylesTree) {
        let preprocessedEngineStylesTree = this._addonPreprocessTree(
          'css',
          engineStylesTree,
        );

        let processedEngineStylesTree = preprocessCss(
          preprocessedEngineStylesTree,
          /* inputPath */ '/',
          /* outputPath */ '/',
          {
            outputPaths: { addon: engineStylesOutputDir + 'engine.css' },
            registry: this.registry,
          },
        );

        processedEngineStylesTree = this.debugTree(
          processedEngineStylesTree,
          'engine-style:postprocessed',
        );

        primaryStyleTree = this._concatStyles(
          'engine',
          processedEngineStylesTree,
          sourceMapConfig,
        );

        primaryStyleTree = this.debugTree(
          primaryStyleTree,
          'engine-style:post-concat',
        );

        if (shouldMinifyCSS) {
          primaryStyleTree = preprocessMinifyCss(
            primaryStyleTree,
            minificationOptions,
          );
        }

        primaryStyleTree = this.debugTree(
          primaryStyleTree,
          'engine-style:output',
        );
      }

      let concatVendorCSSTree = this._concatStyles(
        'engine-vendor',
        vendorCSSTree,
        sourceMapConfig,
      );

      concatVendorCSSTree = this.debugTree(
        concatVendorCSSTree,
        'vendor-style:pre-import',
      );

      let concatMergedVendorCSSTree = mergeTrees([
        concatVendorCSSTree,
        externalTree,
      ]);

      // So, this is weird, but imports are processed in order.
      // This gives the chance for somebody to prepend onto the vendor files.
      let vendorCSSImportTree = buildVendorCSSWithImports.call(
        this,
        concatMergedVendorCSSTree,
        sourceMapConfig,
      );

      if (shouldMinifyCSS) {
        vendorCSSImportTree = preprocessMinifyCss(
          vendorCSSImportTree,
          minificationOptions,
        );
      }

      let mergedVendorCSSWithImportAndEngineStylesTree = mergeTrees(
        [vendorCSSImportTree, primaryStyleTree].filter(Boolean),
        { overwrite: true },
      );

      let combinedProcessedStylesTree = new Funnel(
        mergedVendorCSSWithImportAndEngineStylesTree,
        {
          srcDir: 'engines-dist/',
          destDir: 'engines-dist/',
        },
      );

      // run post processing via the `postprocessTree` hook on the final output
      let finalStylesTree = this._addonPostprocessTree(
        'css',
        combinedProcessedStylesTree,
      );

      return this.debugTree(finalStylesTree, 'styles');
    };

    // We want to do the default `treeForPublic` behavior if we're not a lazy loading engine.
    // If we are a lazy loading engine we now have to manually do the compilation steps for the engine.
    // Luckily the public folder gets merged into the right place in the final output.
    // We'll take advantage of that.
    let originalTreeForPublic = this.treeForPublic;
    this.treeForPublic = function () {
      let hostOptions = findLCAHost(this).options || {};
      let sourceMapConfig = hostOptions.sourcemaps;

      let configTemplatePath = path.join(
        __dirname,
        '/engine-config-node-module.js',
      );
      let configTemplate = fs.readFileSync(configTemplatePath, {
        encoding: 'utf8',
      });

      let configEnvironment = writeFile(
        'engines-dist/' + options.name + '/config/environment.js',
        configTemplate
          .replace('{{MODULE_PREFIX}}', options.name)
          .replace('{{CONFIG}}', JSON.stringify(this.engineConfig())),
      );

      // NOT LAZY LOADING!
      // In this scenario we just want to do the default behavior and bail.
      if (this.lazyLoading.enabled !== true) {
        let originalTree = originalTreeForPublic.apply(this, arguments);
        return mergeTrees([configEnvironment, originalTree]);
      }

      // LAZY LOADING!
      // But we have to implement everything manually for the lazy loading scenario.

      let vendorTree = buildVendorTree.call(this);
      let vendorJSTree = buildVendorJSTree.call(this, vendorTree);
      let externalTree = new Funnel(
        mergeTrees(this.nonDuplicatedAddonInvoke('treeFor', ['vendor']), {
          overwrite: true,
          annotation: `Lazy-engine#treeFor (${options.name} vendor)`,
        }),
        {
          destDir: 'vendor',
          allowEmpty: true,
        },
      );

      let finalStylesTree = this.compileLazyEngineStyles(
        vendorTree,
        externalTree,
      );

      // Move the public tree. It is already all in a folder named `this.name`
      let publicResult = originalTreeForPublic.apply(this, arguments);
      let publicRelocated;
      if (publicResult) {
        publicRelocated = new Funnel(publicResult, {
          destDir: 'engines-dist',
        });
      }

      // Get the child addons public trees.
      // Sometimes this will be an engine tree in which case we need to handle it differently.
      let childAddonsPublicTrees = this.nonDuplicatedAddonInvoke('treeFor', [
        'public',
      ]);
      let childAddonsPublicTreesMerged = mergeTrees(childAddonsPublicTrees, {
        overwrite: true,
      });
      let childLazyEngines = new Funnel(childAddonsPublicTreesMerged, {
        srcDir: 'engines-dist',
        destDir: 'engines-dist',
        allowEmpty: true,
      });
      let childAddonsPublicTreesRelocated = new Funnel(
        childAddonsPublicTreesMerged,
        {
          exclude: ['engines-dist', 'engines-dist/**/*.*'],
          destDir: 'engines-dist/' + this.name,
        },
      );
      let addonsEnginesPublicTreesMerged = mergeTrees(
        [childLazyEngines, childAddonsPublicTreesRelocated],
        { overwrite: true },
      );

      let engineJSTree = buildEngineJSTreeWithoutRoutes.call(this);

      // If babel options aren't defined, we need to transpile the modules.
      if (!this.options || !this.options.babel) {
        engineJSTree = processBabel(engineJSTree);
        vendorJSTree = processBabel(vendorJSTree);
      }

      // Concatenate all of the engine's JavaScript into a single file.

      let concatEngineTree = concat(engineJSTree, {
        allowNone: true,
        inputFiles: ['**/*.js'],
        outputFile: 'engines-dist/' + this.name + '/assets/engine.js',
        sourceMapConfig,
      });

      // Concatenate all of the engine's "vendor" trees
      let concatVendorJSTree = concat(vendorJSTree, {
        allowNone: true,
        inputFiles: ['**/*.js'],
        outputFile: 'engines-dist/' + this.name + '/assets/engine-vendor.js',
        sourceMapConfig,
      });

      let concatMergedVendorJSTree = mergeTrees([
        concatVendorJSTree,
        externalTree,
      ]);

      // So, this is weird, but imports are processed in order.
      // This gives the chance for somebody to prepend onto the vendor files.
      let vendorJSImportTree = buildVendorJSWithImports.call(
        this,
        concatMergedVendorJSTree,
        sourceMapConfig,
      );

      let otherAssets;
      if (this.otherAssets) {
        otherAssets = this.otherAssets();
      }

      // Merge all of our final trees!
      let finalMergeTrees = [
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
      let separateRoutes =
        this.lazyLoading.includeRoutesInApplication === false;
      if (separateRoutes) {
        let engineRoutesTree = buildEngineRoutesJSTree.call(
          this,
          sourceMapConfig,
        );
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
    function () {
      return null;
    };

  /**
    Returns an engine's configuration settings, to be used exclusively by the
    engine.

    By default, this method simply reads the configuration settings from
    an engine's `config/environment.js`.

    @public
    @method engineConfig
    @return {Object} Configuration object that will be provided to the engine.
  */
  options.engineConfig = function (env, baseConfig) {
    let configPath = 'config';

    if (
      this.pkg['ember-addon'] &&
      this.pkg['ember-addon']['engineConfigPath']
    ) {
      configPath = this.pkg['ember-addon']['engineConfigPath'];
    }

    configPath = path.join(this.root, configPath, 'environment.js');

    let key = `${configPath}|${env}`;

    if (this._engineConfig.has(key)) {
      return this._engineConfig.get(key);
    }

    let config;
    if (fs.existsSync(configPath)) {
      let configGenerator = require(configPath);
      let engineConfig = configGenerator(env, baseConfig);
      let addonsConfig = this.getAddonsConfig(env, engineConfig);

      config = merge(addonsConfig, engineConfig);
    } else {
      config = this.getAddonsConfig(env, {});
    }
    this._engineConfig.set(key, config);
    return config;
  };

  /**
    Returns the addons' configuration.

    @private
    @method getAddonsConfig
    @param  {String} env           Environment name
    @param  {Object} engineConfig  Engine configuration
    @return {Object}               Merged configuration of all addons
    */
  options.getAddonsConfig = function (env, engineConfig) {
    this.initializeAddons();

    let initialConfig = merge({}, engineConfig);

    return this.addons.reduce((config, addon) => {
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
  */
  options.contentFor = function (type, config) {
    if (type === 'head') {
      let engineConfig = this.engineConfig(config.environment, {});

      let content =
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
  options.updateFastBootManifest = function (manifest) {
    if (this.lazyLoading.enabled) {
      manifest.vendorFiles.push(
        'engines-dist/' + options.name + '/assets/engine-vendor.js',
      );
      manifest.vendorFiles.push(
        'engines-dist/' + options.name + '/assets/engine.js',
      );
    }

    manifest.vendorFiles.push(
      'engines-dist/' + options.name + '/config/environment.js',
    );

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
    function () {
      const configTemplate = fs.readFileSync(
        `${__dirname}/engine-config-from-meta.js`,
        'UTF8',
      );

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
    // @TODO: remove once support for ember-cli@2.x is dropped.
    // https://github.com/ember-cli/ember-cli/pull/8264
    this._requireBuildPackages && this._requireBuildPackages();

    let cacheKey;
    if (HAS_TREE_CACHE) {
      cacheKey = this.cacheKeyForTree(name);
      let cachedTree = Addon._treeCache.getItem(cacheKey);
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

    let trees;
    if (
      name === 'app' ||
      name === 'styles' ||
      (name === 'addon' && this.lazyLoading.enabled === true) ||
      (name === 'vendor' && this.lazyLoading.enabled === true) ||
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

    let tree = this._treeFor(name);

    if (tree) {
      trees.push(tree);
    }

    if (this.isDevelopingAddon() && this.hintingEnabled() && name === 'app') {
      trees.push(this.jshintAddonTree());
    }

    let mergedTree = mergeTrees(trees.filter(Boolean), {
      overwrite: true,
      annotation: 'Engine#treeFor (' + options.name + ' - ' + name + ')',
    });

    if (HAS_TREE_CACHE) {
      Addon._treeCache.setItem(cacheKey, mergedTree);
    }

    return mergedTree;
  };

  return options;
}

module.exports = {
  buildEngine,
  extend: buildEngine,
};
