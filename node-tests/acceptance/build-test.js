var co = require('co');
var path = require('path');
var fixturify = require('fixturify');
var expect = require('chai').expect;
var AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;

var build = require('../helpers/build');
var InRepoEngine = require('../helpers/in-repo-engine');

/**
 * Creates a regex that matches the definition for the specified module name.
 *
 * @param {String} moduleName
 * @return {RegExp}
 */
function moduleMatcher(moduleName) {
  return new RegExp(`define\\(['"]${moduleName}['"]`);
}

describe('Acceptance', function() {
  describe('build', function() {
    this.timeout(300000);

    const DEFAULT_ROUTABLE_ENGINE_MODULES = [
      'engine',
      'resolver',
      'routes', // FIXME: This shouldn't wind up in the same file as the other modules when lazy loaded.
      'config/environment',
      'templates/application'
    ];

    it('correctly builds eager engine', co.wrap(function* () {
      var app = new AddonTestApp();
      var engineName = 'eager';

      yield app.create('engine-testing', { noFixtures: true });
      yield InRepoEngine.generate(app, engineName, { lazy: false });

      var output = yield build(app);

      output.contains('asset-manifest.json');

      DEFAULT_ROUTABLE_ENGINE_MODULES.forEach(module => {
        output.contains('assets/vendor.js', moduleMatcher(`${engineName}/${module}`));
      });
    }));

    it('correctly builds lazy engine', co.wrap(function* () {
      var app = new AddonTestApp();
      var engineName = 'lazy';

      yield app.create('engine-testing', { noFixtures: true });
      yield InRepoEngine.generate(app, engineName, { lazy: true });

      var output = yield build(app);

      output.contains('asset-manifest.json');
      output.contains('assets/node-asset-manifest.js');
      output.contains('engines-dist/lazy/assets/engine-vendor.css');
      output.contains('engines-dist/lazy/assets/engine-vendor.js');
      output.contains('engines-dist/lazy/assets/engine-vendor.map');
      output.contains('engines-dist/lazy/assets/engine.css');
      output.contains('engines-dist/lazy/assets/engine.js');
      output.contains('engines-dist/lazy/assets/engine.map');

      DEFAULT_ROUTABLE_ENGINE_MODULES.forEach(module => {
        output.contains(`engines-dist/${engineName}/assets/engine.js`, moduleMatcher(`${engineName}/${module}`));
      });
    }));

    it('correctly builds eager engine in lazy engine', co.wrap(function* () {
      var app = new AddonTestApp();
      var engineName = 'lazy';
      var nestedEngineName = 'eager-in-lazy';

      yield app.create('engine-testing', { noFixtures: true });
      var engine = yield InRepoEngine.generate(app, engineName, { lazy: true });

      yield engine.generateNestedEngine(nestedEngineName, { lazy: false });

      var output = yield build(app);

      output.contains('asset-manifest.json');
      output.contains('assets/node-asset-manifest.js');
      output.contains('engines-dist/lazy/assets/engine-vendor.css');
      output.contains('engines-dist/lazy/assets/engine-vendor.js');
      output.contains('engines-dist/lazy/assets/engine-vendor.map');
      output.contains('engines-dist/lazy/assets/engine.css');
      output.contains('engines-dist/lazy/assets/engine.js');
      output.contains('engines-dist/lazy/assets/engine.map');

      DEFAULT_ROUTABLE_ENGINE_MODULES.forEach(module => {
        output.contains(`engines-dist/${engineName}/assets/engine.js`, moduleMatcher(`${engineName}/${module}`));
        output.contains(`engines-dist/${engineName}/assets/engine-vendor.js`, moduleMatcher(`${nestedEngineName}/${module}`));
      });
    }));

    it('correctly builds lazy engine in eager engine', co.wrap(function* () {
      var app = new AddonTestApp();
      var engineName = 'eager';
      var nestedEngineName = 'lazy-in-eager';

      yield app.create('engine-testing', { noFixtures: true });
      var engine = yield InRepoEngine.generate(app, engineName, { lazy: false });

      yield engine.generateNestedEngine(nestedEngineName, { lazy: true });

      var output = yield build(app);

      output.contains('asset-manifest.json');
      output.contains('assets/node-asset-manifest.js');
      output.contains('engines-dist/lazy-in-eager/assets/engine-vendor.css');
      output.contains('engines-dist/lazy-in-eager/assets/engine-vendor.js');
      output.contains('engines-dist/lazy-in-eager/assets/engine-vendor.map');
      output.contains('engines-dist/lazy-in-eager/assets/engine.css');
      output.contains('engines-dist/lazy-in-eager/assets/engine.js');
      output.contains('engines-dist/lazy-in-eager/assets/engine.map');

      DEFAULT_ROUTABLE_ENGINE_MODULES.forEach(module => {
        output.contains('assets/vendor.js', moduleMatcher(`${engineName}/${module}`));
        output.contains(`engines-dist/${nestedEngineName}/assets/engine.js`, moduleMatcher(`${nestedEngineName}/${module}`));
      });
    }));

    it('correctly builds lazy engine in lazy engine', co.wrap(function* () {
      var app = new AddonTestApp();
      var engineName = 'lazy';
      var nestedEngineName = 'lazy-in-lazy';

      yield app.create('engine-testing', { noFixtures: true });
      var engine = yield InRepoEngine.generate(app, engineName, { lazy: true });

      yield engine.generateNestedEngine(nestedEngineName, { lazy: true });

      var output = yield build(app);

      output.contains('asset-manifest.json');
      output.contains('assets/node-asset-manifest.js');
      output.contains('engines-dist/lazy/assets/engine-vendor.css');
      output.contains('engines-dist/lazy/assets/engine-vendor.js');
      output.contains('engines-dist/lazy/assets/engine-vendor.map');
      output.contains('engines-dist/lazy/assets/engine.css');
      output.contains('engines-dist/lazy/assets/engine.js');
      output.contains('engines-dist/lazy/assets/engine.map');
      output.contains('engines-dist/lazy-in-lazy/assets/engine-vendor.css');
      output.contains('engines-dist/lazy-in-lazy/assets/engine-vendor.js');
      output.contains('engines-dist/lazy-in-lazy/assets/engine-vendor.map');
      output.contains('engines-dist/lazy-in-lazy/assets/engine.css');
      output.contains('engines-dist/lazy-in-lazy/assets/engine.js');
      output.contains('engines-dist/lazy-in-lazy/assets/engine.map');

      DEFAULT_ROUTABLE_ENGINE_MODULES.forEach(module => {
        output.contains(`engines-dist/${engineName}/assets/engine.js`, moduleMatcher(`${engineName}/${module}`));
        output.contains(`engines-dist/${nestedEngineName}/assets/engine.js`, moduleMatcher(`${nestedEngineName}/${module}`));
      });
    }));

    it('correctly builds eager engine in eager engine', co.wrap(function* () {
      var app = new AddonTestApp();
      var engineName = 'eager';
      var nestedEngineName = 'eager-in-eager';

      yield app.create('engine-testing', { noFixtures: true });
      var engine = yield InRepoEngine.generate(app, engineName, { lazy: false });

      yield engine.generateNestedEngine(nestedEngineName, { lazy: false });

      var output = yield build(app);

      output.contains('asset-manifest.json');
      output.contains('assets/node-asset-manifest.js');

      DEFAULT_ROUTABLE_ENGINE_MODULES.forEach(module => {
        output.contains('assets/vendor.js', moduleMatcher(`${engineName}/${module}`));
        output.contains('assets/vendor.js', moduleMatcher(`${nestedEngineName}/${module}`));
      });
    }));

    it('correctly builds addon in eager engine', co.wrap(function* () {
      var app = new AddonTestApp();
      var engineName = 'eager';
      var addonName = 'nested';

      yield app.create('engine-testing', { noFixtures: true });
      var engine = yield InRepoEngine.generate(app, engineName, { lazy: false });
      var addon = yield engine.generateNestedAddon(addonName);

      addon.writeFixture({
        app: {
          'foo.js': '// should wind up in engine namespace'
        },
        addon: {
          components: {
            'bar.js': '// should wind up in addon namespace'
          },
          templates: {
            components: {
              'bar.hbs': '<h1>bar</h1>'
            }
          }
        }
      });

      var output = yield build(app);

      output.contains('asset-manifest.json');

      output.contains('assets/vendor.js', moduleMatcher(`${engineName}/foo`));
      output.contains('assets/vendor.js', moduleMatcher(`${addonName}/components/bar`));
      output.contains('assets/vendor.js', moduleMatcher(`${addonName}/templates/components/bar`));

      DEFAULT_ROUTABLE_ENGINE_MODULES.forEach(module => {
        output.contains('assets/vendor.js', moduleMatcher(`${engineName}/${module}`));
      });
    }));

    it('correctly builds addon in lazy engine', co.wrap(function* () {
      var app = new AddonTestApp();
      var engineName = 'lazy';
      var addonName = 'nested';

      yield app.create('engine-testing', { noFixtures: true });
      var engine = yield InRepoEngine.generate(app, engineName, { lazy: true });
      var addon = yield engine.generateNestedAddon(addonName);

      addon.writeFixture({
        app: {
          'foo.js': '// should wind up in engine namespace'
        },
        addon: {
          components: {
            'bar.js': '// should wind up in addon namespace'
          },
          templates: {
            components: {
              'bar.hbs': '<h1>bar</h1>'
            }
          }
        }
      });

      var output = yield build(app);

      output.contains('asset-manifest.json');
      output.contains('assets/node-asset-manifest.js');
      output.contains(`engines-dist/${engineName}/assets/engine-vendor.css`);
      output.contains(`engines-dist/${engineName}/assets/engine-vendor.js`);
      output.contains(`engines-dist/${engineName}/assets/engine-vendor.map`);
      output.contains(`engines-dist/${engineName}/assets/engine.css`);
      output.contains(`engines-dist/${engineName}/assets/engine.js`);
      output.contains(`engines-dist/${engineName}/assets/engine.map`);

      output.contains(`engines-dist/${engineName}/assets/engine.js`, moduleMatcher(`${engineName}/foo`));
      output.contains(`engines-dist/${engineName}/assets/engine-vendor.js`, moduleMatcher(`${addonName}/components/bar`));
      output.contains(`engines-dist/${engineName}/assets/engine-vendor.js`, moduleMatcher(`${addonName}/templates/components/bar`));

      DEFAULT_ROUTABLE_ENGINE_MODULES.forEach(module => {
        output.contains(`engines-dist/${engineName}/assets/engine.js`, moduleMatcher(`${engineName}/${module}`));
      });
    }));

    it('invokes trees and executes hooks in the proper order and handles imports for engines', co.wrap(function* () {
      var app = new AddonTestApp();
      var engineName = 'tree-invocation-order';

      yield app.create('engine-testing', { noFixtures: true });
      var engine = yield InRepoEngine.generate(app, engineName, { lazy: true });

      var fixture = fixturify.readSync(path.resolve(__dirname, '../fixtures/tree-invocation-order'));
      engine.writeFixture(fixture);

      var output = yield build(app);

      // routes.js and imports are properly hoisted
      // FIXME: These are wrong! They should be in assets/vendor.js
      output.contains('engines-dist/tree-invocation-order/assets/engine.js', moduleMatcher('tree-invocation-order/routes'));
      output.contains('engines-dist/tree-invocation-order/assets/engine.js', moduleMatcher('tree-invocation-order/tree-invocation-order-import-target'));

      // Basic css
      output.contains('engines-dist/tree-invocation-order/assets/engine.css', new RegExp('tree-invocation-order/addon/styles/addon.css'));

      // app.import and this.import of css files
      output.contains('assets/vendor.css', new RegExp('tree-invocation-order/vendor/css/appimport.css'));
      output.contains('engines-dist/tree-invocation-order/assets/engine-vendor.css', new RegExp('tree-invocation-order/vendor/css/thisimport.css'));

      // app.import and this.import of js files. The this.import is prepended, so make sure it is first.
      output.contains('assets/vendor.js', new RegExp('tree-invocation-order/vendor/js/appimport.js'));
      output.contains('engines-dist/tree-invocation-order/assets/engine-vendor.js', new RegExp('^// tree-invocation-order/vendor/js/thisimport.js'));

      // Validates tree invocation order
      output.contains('engines-dist/tree-invocation-order/assets/circle.svg');

      // Validates inclusion of public assets
      output.contains('engines-dist/tree-invocation-order/tree-invocation-order-public-asset.html');

      DEFAULT_ROUTABLE_ENGINE_MODULES.forEach(module => {
        output.contains(`engines-dist/${engineName}/assets/engine.js`, moduleMatcher(`${engineName}/${module}`));
      });
    }));
  });
});
