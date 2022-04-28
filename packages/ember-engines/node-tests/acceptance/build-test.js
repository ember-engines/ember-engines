'use strict';

const expect = require('chai').expect;
const AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;
const build = require('../helpers/build');
const InRepoAddon = require('../helpers/in-repo-addon');
const InRepoEngine = require('../helpers/in-repo-engine');
const expectedManifests = require('../fixtures/expected-manifests');
const matchers = require('../helpers/matchers');

const moduleMatcher = matchers.module;
const reexportMatcher = matchers.reexport;
const cssCommentMatcher = matchers.cssComment;

const CreateOptions = { noFixtures: true, emberVersion: '^3.28.0' };

describe('Acceptance', function() {
  describe('build', function() {
    this.timeout(450000);

    const DEFAULT_ROUTABLE_ENGINE_MODULES = [
      'engine',
      'resolver',
      'config/environment',
      'templates/application',
    ];

    it(
      'correctly builds eager engine',
      async function() {
        let app = new AddonTestApp();
        let engineName = 'eager';

        await app.create('engine-testing', CreateOptions);
        await InRepoEngine.generate(app, engineName, { lazy: false });

        let output = await build(app);

        // Only special file we add is the manifest for eager engines
        expect(output.manifest()).to.deep.equal(expectedManifests['eager']);
        output.contains('assets/node-asset-manifest.js');
        output.contains(
          'assets/vendor.js',
          moduleMatcher(`${engineName}/routes`)
        );
        output.contains(
          'assets/vendor.css',
          cssCommentMatcher(`${engineName}.css`)
        );

        // Check that all of the modules got merged into vendor
        DEFAULT_ROUTABLE_ENGINE_MODULES.forEach(module => {
          output.contains(
            'assets/vendor.js',
            moduleMatcher(`${engineName}/${module}`)
          );
        });
      });

    it(
      'correctly builds lazy engine',
      async function() {
        let app = new AddonTestApp();
        let engineName = 'lazy';

        await app.create('engine-testing', CreateOptions);
        await InRepoEngine.generate(app, engineName, { lazy: true });

        let output = await build(app);

        // Verify we have the manifest and the lazy engine assets
        expect(output.manifest()).to.deep.equal(expectedManifests['lazy']);
        output.contains('assets/node-asset-manifest.js');
        // Engine inherites its environment from the parent
        output.contains(`engines-dist/${engineName}/config/environment.js`);
        output.contains(`engines-dist/${engineName}/assets/engine-vendor.css`);
        output.contains(`engines-dist/${engineName}/assets/engine-vendor.js`);
        output.contains(`engines-dist/${engineName}/assets/engine-vendor.map`);
        output.contains(
          `engines-dist/${engineName}/assets/engine.css`,
          cssCommentMatcher(`${engineName}.css`)
        );
        output.contains(`engines-dist/${engineName}/assets/engine.js`);
        output.contains(`engines-dist/${engineName}/assets/engine.map`);
        output.contains(
          'assets/vendor.js',
          moduleMatcher(`${engineName}/routes`)
        );

        DEFAULT_ROUTABLE_ENGINE_MODULES.forEach(module => {
          // Check that all of the modules got merged into the engine.js file
          output.contains(
            `engines-dist/${engineName}/assets/engine.js`,
            moduleMatcher(`${engineName}/${module}`)
          );
        });
      });

    it(
      'minifies a lazy engines css in production builds',
      async function() {
        let app = new AddonTestApp();
        let engineName = 'lazy';

        await app.create('engine-testing', CreateOptions);
        await InRepoEngine.generate(app, engineName, { lazy: true });

        let output = await build(app, 'production');

        let lazyFiles = output.manifest().bundles.lazy.assets;

        for (let file of lazyFiles) {
          if (file.type === 'css') {
            // remove leading `/`
            let filePath = file.uri.slice(1);

            // all css files should be empty, since minification
            // strips the comments we add
            expect(output.file(filePath)).to.equal('');
          }
        }
      });

    it(
      'correctly builds eager engine in lazy engine',
      async function() {
        let app = new AddonTestApp();
        let engineName = 'lazy';
        let nestedEngineName = 'eager-in-lazy';

        await app.create('engine-testing', CreateOptions);
        let engine = await InRepoEngine.generate(app, engineName, {
          lazy: true,
        });

        await engine.generateNestedEngine(nestedEngineName, { lazy: false });

        let output = await build(app);

        // Verify we have the manifest and the lazy engine assets
        expect(output.manifest()).to.deep.equal(
          expectedManifests['eager-in-lazy']
        );
        output.contains('assets/node-asset-manifest.js');
        output.contains(
          `engines-dist/${engineName}/assets/engine-vendor.css`,
          cssCommentMatcher(`${nestedEngineName}.css`)
        );
        output.contains(`engines-dist/${engineName}/assets/engine-vendor.js`);
        output.contains(`engines-dist/${engineName}/assets/engine-vendor.map`);
        output.contains(
          `engines-dist/${engineName}/assets/engine.css`,
          cssCommentMatcher(`${engineName}.css`)
        );
        output.contains(`engines-dist/${engineName}/assets/engine.js`);
        output.contains(`engines-dist/${engineName}/assets/engine.map`);

        output.contains(
          'assets/vendor.js',
          moduleMatcher(`${engineName}/routes`)
        );
        output.contains(
          'assets/vendor.js',
          moduleMatcher(`${nestedEngineName}/routes`)
        );

        DEFAULT_ROUTABLE_ENGINE_MODULES.forEach(module => {
          // Check that all of the lazy engine modules got merged into the engine.js file
          output.contains(
            `engines-dist/${engineName}/assets/engine.js`,
            moduleMatcher(`${engineName}/${module}`)
          );

          // Check that all of the nested eager engine modules got merged into the engine-vendor.js file
          output.contains(
            `engines-dist/${engineName}/assets/engine-vendor.js`,
            moduleMatcher(`${nestedEngineName}/${module}`)
          );
        });
      });

    it(
      'correctly builds lazy engine in eager engine',
      async function() {
        let app = new AddonTestApp();
        let engineName = 'eager';
        let nestedEngineName = 'lazy-in-eager';

        await app.create('engine-testing', CreateOptions);
        let engine = await InRepoEngine.generate(app, engineName, {
          lazy: false,
        });

        await engine.generateNestedEngine(nestedEngineName, { lazy: true });

        let output = await build(app);

        // Verify we have the manifest and the nested lazy engine assets
        expect(output.manifest()).to.deep.equal(
          expectedManifests['lazy-in-eager']
        );
        output.contains('assets/node-asset-manifest.js');
        output.contains(
          `engines-dist/${nestedEngineName}/assets/engine-vendor.css`
        );
        output.contains(
          `engines-dist/${nestedEngineName}/assets/engine-vendor.js`
        );
        output.contains(
          `engines-dist/${nestedEngineName}/assets/engine-vendor.map`
        );
        output.contains(
          `engines-dist/${nestedEngineName}/assets/engine.css`,
          cssCommentMatcher(`${nestedEngineName}.css`)
        );
        output.contains(`engines-dist/${nestedEngineName}/assets/engine.js`);
        output.contains(`engines-dist/${nestedEngineName}/assets/engine.map`);

        output.contains(
          'assets/vendor.js',
          moduleMatcher(`${engineName}/routes`)
        );
        output.contains(
          'assets/vendor.js',
          moduleMatcher(`${nestedEngineName}/routes`)
        );
        output.contains(
          'assets/vendor.css',
          cssCommentMatcher(`${engineName}.css`)
        );

        DEFAULT_ROUTABLE_ENGINE_MODULES.forEach(module => {
          // Check that all of the eager engine modules got merged into the vendor.js file
          output.contains(
            'assets/vendor.js',
            moduleMatcher(`${engineName}/${module}`)
          );

          // Check that all of the lazy engine modules got merged into the engine.js file
          output.contains(
            `engines-dist/${nestedEngineName}/assets/engine.js`,
            moduleMatcher(`${nestedEngineName}/${module}`)
          );
        });
      });

    it(
      'correctly builds lazy engine in lazy engine',
      async function() {
        var app = new AddonTestApp();
        var engineName = 'lazy';
        var nestedEngineName = 'lazy-in-lazy';

        await app.create('engine-testing', CreateOptions);
        var engine = await InRepoEngine.generate(app, engineName, {
          lazy: true,
        });

        await engine.generateNestedEngine(nestedEngineName, { lazy: true });

        var output = await build(app);

        // Verify we have the manifest and assets for both lazy engines
        expect(output.manifest()).to.deep.equal(
          expectedManifests['lazy-in-lazy']
        );
        output.contains('assets/node-asset-manifest.js');

        output.contains(`engines-dist/${engineName}/assets/engine-vendor.css`);
        output.contains(`engines-dist/${engineName}/assets/engine-vendor.js`);
        output.contains(`engines-dist/${engineName}/assets/engine-vendor.map`);
        output.contains(
          `engines-dist/${engineName}/assets/engine.css`,
          cssCommentMatcher(`${engineName}.css`)
        );
        output.contains(`engines-dist/${engineName}/assets/engine.js`);
        output.contains(`engines-dist/${engineName}/assets/engine.map`);

        output.contains(
          `engines-dist/${nestedEngineName}/assets/engine-vendor.css`
        );
        output.contains(
          `engines-dist/${nestedEngineName}/assets/engine-vendor.js`
        );
        output.contains(
          `engines-dist/${nestedEngineName}/assets/engine.css`,
          cssCommentMatcher(`${nestedEngineName}.css`)
        );
        output.contains(`engines-dist/${nestedEngineName}/assets/engine.js`);

        output.contains(
          'assets/vendor.js',
          moduleMatcher(`${engineName}/routes`)
        );
        output.contains(
          'assets/vendor.js',
          moduleMatcher(`${nestedEngineName}/routes`)
        );

        DEFAULT_ROUTABLE_ENGINE_MODULES.forEach(module => {
          // Check that all of the lazy engine modules got merged into the engine's engine.js file
          output.contains(
            `engines-dist/${engineName}/assets/engine.js`,
            moduleMatcher(`${engineName}/${module}`)
          );

          // Check that all of the lazy engine modules got merged into the nested engine's engine.js file
          output.contains(
            `engines-dist/${nestedEngineName}/assets/engine.js`,
            moduleMatcher(`${nestedEngineName}/${module}`)
          );
        });
      });

    it(
      'correctly builds eager engine in eager engine',
      async function() {
        let app = new AddonTestApp();
        let engineName = 'eager';
        let nestedEngineName = 'eager-in-eager';

        await app.create('engine-testing', CreateOptions);
        let engine = await InRepoEngine.generate(app, engineName, {
          lazy: false,
        });

        await engine.generateNestedEngine(nestedEngineName, { lazy: false });

        let output = await build(app);

        // Verify we have the manifest
        expect(output.manifest()).to.deep.equal(expectedManifests['eager-in-eager']);
        output.contains('assets/node-asset-manifest.js');

        output.contains(
          'assets/vendor.js',
          moduleMatcher(`${engineName}/routes`)
        );
        output.contains(
          'assets/vendor.js',
          moduleMatcher(`${nestedEngineName}/routes`)
        );
        output.contains(
          'assets/vendor.css',
          cssCommentMatcher(`${engineName}.css`)
        );
        // FIXME: This is eager-in-eager css isn't being included in the output
        // output.contains('assets/vendor.css', cssCommentMatcher(`${nestedEngineName}.css`));

        DEFAULT_ROUTABLE_ENGINE_MODULES.forEach(module => {
          // Check that all of the modules for both engines got merged into vendor.js
          output.contains(
            'assets/vendor.js',
            moduleMatcher(`${engineName}/${module}`)
          );
          output.contains(
            'assets/vendor.js',
            moduleMatcher(`${nestedEngineName}/${module}`)
          );
        });
      });

    it(
      'correctly builds addon in eager engine',
      async function() {
        let app = new AddonTestApp();
        let engineName = 'eager';
        let addonName = 'nested';

        await app.create('engine-testing', CreateOptions);
        let engine = await InRepoEngine.generate(app, engineName, {
          lazy: false,
        });
        let addon = await engine.generateNestedAddon(addonName);

        addon.writeFixture({
          app: {
            'foo.js': 'export { default } from "nested/components/bar";',
          },
          addon: {
            components: {
              'bar.js': '// should wind up in addon namespace',
            },
            templates: {
              components: {
                'bar.hbs': '<h1>bar</h1>',
              },
            },
          },
        });

        let output = await build(app);

        // Verify app files in addon wind up in engine's namespace in vendor.js
        output.contains(
          'assets/vendor.js',
          reexportMatcher(`${addonName}/components/bar`, `${engineName}/foo`)
        );

        // Verify addon files in addon wind up in addon's namespace in vendor.js
        output.contains(
          'assets/vendor.js',
          moduleMatcher(`${addonName}/components/bar`)
        );
        output.contains(
          'assets/vendor.js',
          moduleMatcher(`${addonName}/templates/components/bar`)
        );
      });

    it(
      'correctly builds addon in lazy engine',
      async function() {
        let app = new AddonTestApp();
        let engineName = 'lazy';
        let addonName = 'nested';

        await app.create('engine-testing', CreateOptions);
        let engine = await InRepoEngine.generate(app, engineName, {
          lazy: true,
        });
        let addon = await engine.generateNestedAddon(addonName);

        addon.writeFixture({
          app: {
            'foo.js': 'export { default } from "nested/components/bar";',
          },
          addon: {
            components: {
              'bar.js': '// should wind up in addon namespace',
            },
            templates: {
              components: {
                'bar.hbs': '<h1>bar</h1>',
              },
            },
          },
          prebuilt_vendor: {
            'external_dependency.js': `define("external_dependency", ["exports"], function (_exports) {});`
          },
          'index.js': `module.exports = {
             name: '${addonName}',
             treeForVendor() {
               return '${addon.path}/prebuilt_vendor';
             },
             included: function(app) {
               this._super.included.apply(this, arguments);
               app.import('vendor/external_dependency.js');
             }
           }`,
        });

        let output = await build(app);

        // Verify app files in addon wind up in engine's namespace in engine.js
        output.contains(
          `engines-dist/${engineName}/assets/engine.js`,
          reexportMatcher(`${addonName}/components/bar`, `${engineName}/foo`)
        );

        // Verify addon files in addon wind up in addon's namespace in enigne-vendor.js
        output.contains(
          `engines-dist/${engineName}/assets/engine-vendor.js`,
          moduleMatcher(`${addonName}/components/bar`)
        );
        output.contains(
          `engines-dist/${engineName}/assets/engine-vendor.js`,
          moduleMatcher(`${addonName}/templates/components/bar`)
        );
        output.contains(
          `engines-dist/${engineName}/assets/engine-vendor.js`,
          moduleMatcher('external_dependency')
        );
      });

    it(
      'invokes trees and executes hooks in the proper order and handles imports for engines',
      async function() {
        let app = new AddonTestApp();
        let engineName = 'tree-invocation-order';

        await app.create('engine-testing', CreateOptions);
        let engine = await InRepoEngine.generate(app, engineName, {
          lazy: true,
        });

        engine.writeFixture(require(`../fixtures/${engineName}/data`));

        let output = await build(app);

        expect(output.manifest()).to.deep.equal(
          expectedManifests['tree-invocation-order']
        );

        // routes.js and imports are properly hoisted
        output.contains(
          `assets/vendor.js`,
          moduleMatcher('tree-invocation-order/routes')
        );
        output.contains(
          `assets/vendor.js`,
          moduleMatcher(
            'tree-invocation-order/tree-invocation-order-import-target'
          )
        );

        // Basic css
        output.contains(
          `engines-dist/${engineName}/assets/engine.css`,
          cssCommentMatcher('tree-invocation-order/addon/styles/addon.css')
        );

        // app.import and this.import of css files
        output.contains(
          'assets/vendor.css',
          cssCommentMatcher('tree-invocation-order/vendor/css/appimport.css')
        );
        output.contains(
          `engines-dist/${engineName}/assets/engine-vendor.css`,
          cssCommentMatcher('tree-invocation-order/vendor/css/thisimport.css')
        );

        // app.import and this.import of js files. The this.import is prepended, so make sure it is first.
        output.contains(
          'assets/vendor.js',
          new RegExp('tree-invocation-order/vendor/js/appimport.js')
        );
        output.contains(
          `engines-dist/${engineName}/assets/engine-vendor.js`,
          new RegExp('^// tree-invocation-order/vendor/js/thisimport.js')
        );

        // Validates tree invocation order
        output.contains(`engines-dist/${engineName}/assets/circle.svg`);

        // Validates inclusion of public assets
        output.contains(
          `engines-dist/${engineName}/tree-invocation-order-public-asset.html`
        );

        // Default modules wind up in proper place still
        DEFAULT_ROUTABLE_ENGINE_MODULES.forEach(module => {
          output.contains(
            `engines-dist/${engineName}/assets/engine.js`,
            moduleMatcher(`${engineName}/${module}`)
          );
        });
      });

    it(
      'correctly hoists routes.js and its imports',
      async function() {
        let app = new AddonTestApp();
        let engineName = 'routes-hoisting';

        await app.create('engine-testing', CreateOptions);
        let engine = await InRepoEngine.generate(app, engineName, {
          lazy: true,
        });

        engine.writeFixture(require(`../fixtures/${engineName}/data`));

        let output = await build(app);

        let hoistedModules = [
          'routes',
          'absolute-routes-import',
          'relative-routes-import',
        ];

        hoistedModules.forEach(module => {
          let matcher = moduleMatcher(`${engineName}/${module}`);
          output.contains(`assets/vendor.js`, matcher);
          output.doesNotContain(
            `engines-dist/${engineName}/assets/engine.js`,
            matcher
          );
        });
      });

    it(
      'correctly separates routes.js and its imports when lazyLoading.includeRoutesInApplication is false',
      async function() {
        let app = new AddonTestApp();
        let engineName = 'separate-routes';

        await app.create('engine-testing', CreateOptions);
        let engine = await InRepoEngine.generate(app, engineName, {
          lazy: true,
        });

        engine.writeFixture(require(`../fixtures/${engineName}/data`));

        let output = await build(app);

        let hoistedModules = [
          'routes',
          'absolute-routes-import',
          'relative-routes-import',
        ];

        hoistedModules.forEach(module => {
          let matcher = moduleMatcher(`${engineName}/${module}`);
          output.doesNotContain(`assets/vendor.js`, matcher);
          output.contains(
            `engines-dist/${engineName}/assets/routes.js`,
            matcher
          );
        });
      });

    it(
      'does not duplicate addons in lazy engines that appear in the host',
      async function() {
        let app = new AddonTestApp();
        let appName = 'engine-testing';
        let engineName = 'lazy';
        let addonName = 'nested';

        await app.create(appName, CreateOptions);
        let addon = await InRepoAddon.generate(app, addonName);
        let engine = await InRepoEngine.generate(app, engineName, {
          lazy: true,
        });

        engine.nest(addon);

        addon.writeFixture({
          app: {
            'foo.js': `export { default } from 'nested/components/foo';`,
          },
          addon: {
            styles: {
              'addon.css': `/* ${addonName}.css */`,
            },
            components: {
              'foo.js': `export default {}`,
            },
            templates: {
              components: {
                'foo.hbs': `<h1>foo</h1>`,
              },
            },
          },
          public: {
            'some-file.txt': `some file`,
          },
        });

        let output = await build(app);

        // Verify all the files are in the host's assets
        output.contains(
          `assets/${appName}.js`,
          moduleMatcher(`${appName}/foo`)
        );
        output.contains('nested/some-file.txt');
        output.contains(
          'assets/vendor.js',
          moduleMatcher(`${addonName}/components/foo`)
        );
        output.contains(
          'assets/vendor.js',
          moduleMatcher(`${addonName}/templates/components/foo`)
        );
        output.contains(
          'assets/vendor.css',
          cssCommentMatcher(`${addonName}.css`)
        );

        // App folder should still be merged into the Engine's namespace
        output.contains(
          `engines-dist/${engineName}/assets/engine.js`,
          reexportMatcher(`${addonName}/components/foo`, `${engineName}/foo`)
        );

        // All other files should not be included
        output.doesNotContain(
          `engines-dist/${engineName}/nested/some-file.txt`
        );
        output.doesNotContain(
          `engines-dist/${engineName}/assets/engine-vendor.js`,
          moduleMatcher(`${addonName}/components/foo`)
        );
        output.doesNotContain(
          `engines-dist/${engineName}/assets/engine-vendor.js`,
          moduleMatcher(`${addonName}/templates/components/foo`)
        );
        output.doesNotContain(
          `engines-dist/${engineName}/assets/engine-vendor.css`,
          cssCommentMatcher(`${addonName}.css`)
        );
      });

    it(
      'duplicates an addon in lazy engines when the tree returned by the addon is different',
      async function() {
        let app = new AddonTestApp();
        let appName = 'engine-testing';
        let engineName = 'lazy';
        let addonName = 'nested';

        await app.create(appName, CreateOptions);
        let addon = await InRepoAddon.generate(app, addonName);
        let engine = await InRepoEngine.generate(app, engineName, {
          lazy: true,
        });

        engine.nest(addon);

        addon.writeFixture({
          app: {
            'foo.js': `export { default } from 'nested/components/foo';`,
          },
          addon: {
            styles: {
              'addon.css': `/* ${addonName}.css */`,
            },
            components: {
              'foo.js': `export default {}`,
            },
            templates: {
              components: {
                'foo.hbs': `<h1>foo</h1>`,
              },
            },
          },
          public: {
            'some-file.txt': `some file`,
          },
          'index.js': `module.exports = {
                       name: '${addonName}',
                       treeForPublic: function(tree) { return this._super(tree); }
                     }`,
        });

        let output = await build(app);

        // Verify all the files are in the host's assets
        output.contains(
          `assets/${appName}.js`,
          moduleMatcher(`${appName}/foo`)
        );
        output.contains(`${addonName}/some-file.txt`);
        output.contains(
          'assets/vendor.js',
          moduleMatcher(`${addonName}/components/foo`)
        );
        output.contains(
          'assets/vendor.js',
          moduleMatcher(`${addonName}/templates/components/foo`)
        );
        output.contains(
          'assets/vendor.css',
          cssCommentMatcher(`${addonName}.css`)
        );

        // Public file should be included in the engine as it is not the same tree
        output.contains(
          `engines-dist/${engineName}/${addonName}/some-file.txt`
        );

        // All other files should not be included
        output.doesNotContain(
          `engines-dist/${engineName}/assets/engine-vendor.js`,
          moduleMatcher(`${addonName}/components/foo`)
        );
        output.doesNotContain(
          `engines-dist/${engineName}/assets/engine-vendor.js`,
          moduleMatcher(`${addonName}/templates/components/foo`)
        );
        output.doesNotContain(
          `engines-dist/${engineName}/assets/engine-vendor.css`,
          cssCommentMatcher(`${addonName}.css`)
        );
      });
  });
});
