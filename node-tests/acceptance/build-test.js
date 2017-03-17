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
      'routes',
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
  });
});
