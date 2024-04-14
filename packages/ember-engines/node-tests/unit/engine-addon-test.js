'use strict';

const EngineAddon = require('../../lib/engine-addon');
const EmberAddon = require('ember-cli/lib/models/addon');
const MockProject = require('ember-cli/tests/helpers/mock-project');
const expect = require('chai').expect;
const sinon = require('sinon');
const rewire = require('rewire');
const path = require('path');
const memoize = require('../../lib/utils/memoize');

describe('engine-addon', function () {
  describe('building an engine', function () {
    it('using the `extend` function', function () {
      const EngineAddon = require('../../lib/engine-addon');
      const engine = EngineAddon.extend({
        name: 'testing',
      });

      expect(engine.name).to.eql('testing');
    });

    it('using the `buildEngine` function', function () {
      const { buildEngine } = require('../../lib/engine-addon');
      const engine = buildEngine({
        name: 'testing',
      });

      expect(engine.name).to.eql('testing');
    });
  });

  describe('engineConfig', function () {
    const EngineAddon = require('../../lib/engine-addon');

    it('caches per environment', function () {
      // TODO: EngineAddon is crazy, it will need to be refactored to cleanup this test
      const addon = EngineAddon.extend({
        name: 'testing',
        // eslint-disable-next-line ember/avoid-leaking-state-in-ember-objects
        lazyLoading: { enabled: true },
      });
      addon.pkg = {};
      addon.root = path.join(__dirname, '../fixtures/engine-config/');
      addon._engineConfig = new Map();
      addon.initializeAddons = function () {};
      addon.addons = [];

      expect(addon.engineConfig()).to.eql({ env: undefined });
      expect(addon.engineConfig('test')).to.eql({ env: 'test' });
      expect(addon.engineConfig('bar')).to.eql({ env: 'bar' });
      expect(addon.engineConfig('test')).to.eql({ env: 'test' });
      expect(addon.engineConfig('bar')).to.eql({ env: 'bar' });

      expect(addon.engineConfig('test')).to.eql(addon.engineConfig('test'));
      expect(addon.engineConfig('bar')).to.eql(addon.engineConfig('bar'));
    });
  });

  describe('keyword warning', function () {
    let Addon, project, pkg;

    beforeEach(function () {
      pkg = {};

      Addon = EmberAddon.extend(
        EngineAddon.extend({
          name: 'testing',
          // eslint-disable-next-line ember/avoid-leaking-state-in-ember-objects
          lazyLoading: { enabled: true },
        }),
      );

      Addon = Addon.extend({
        root: path.join(__dirname, '../fixtures/engine-config/'),
        pkg,
      });

      project = new MockProject();
    });

    it('warns to the console when pkg.keywords does not include ember-engines', function () {
      pkg.keywords = ['ember-addon'];
      new Addon(project, project);

      expect(project.ui.output).to.include('keywords section');
    });

    it('warns to the console when pkg.keywords does not exist', function () {
      pkg.keywords = undefined;
      new Addon(project, project);

      expect(project.ui.output).to.include('keywords section');
    });
  });

  describe('updateFastBootManifest', function () {
    const EngineAddon = require('../../lib/engine-addon');

    it('adds necessary vendorFiles to the manifest when lazyLoading is enabled', function () {
      const addon = EngineAddon.extend({
        name: 'testing',
        // eslint-disable-next-line ember/avoid-leaking-state-in-ember-objects
        lazyLoading: { enabled: true },
      });

      const manifest = { vendorFiles: ['one.js', 'two.js'] };
      addon.updateFastBootManifest(manifest);

      expect(manifest).to.deep.equal({
        vendorFiles: [
          'one.js',
          'two.js',
          'engines-dist/testing/assets/engine-vendor.js',
          'engines-dist/testing/assets/engine.js',
          'engines-dist/testing/config/environment.js',
        ],
      });
    });

    it('add config/environment file to the manifest when lazyLoading is disabled', function () {
      const addon = EngineAddon.extend({
        name: 'testing',
        // eslint-disable-next-line ember/avoid-leaking-state-in-ember-objects
        lazyLoading: { enabled: false },
      });

      const manifest = { vendorFiles: ['one.js', 'two.js'] };
      addon.updateFastBootManifest(manifest);

      expect(manifest).to.deep.equal({
        vendorFiles: [
          'one.js',
          'two.js',
          'engines-dist/testing/config/environment.js',
        ],
      });
    });
  });

  describe('buildExternalTree', function () {
    const memoizeStub = sinon.stub(memoize, 'memoize').callsFake((func) => {
      return func;
    });
    const EngineAddon = rewire('../../lib/engine-addon');
    const buildExternalTree = EngineAddon.__get__('buildExternalTree');

    beforeEach(function () {
      this.treePaths = { vendor: 'config' };
      this.root = path.join(__dirname, '../fixtures/engine-config/');
      this._nodeModules = new Map();
      this._customTransformsMap = new Map();

      this._nodeModules.set('/mock/path/one', {
        name: 'mock-module-one',
        path: '/mock/path/one',
      });
      this._nodeModules.set('/mock/path/two', {
        name: 'mock-module-two',
        path: '/mock/path/two',
      });
      this._customTransformsMap.set('amd', {
        files: [],
        options: {},
        callback: () => {},
        processOptions: () => {},
      });
    });

    after(function () {
      memoizeStub.reset();
    });

    it('does not add vendor path if tree path is empty', function () {
      this.treePaths = { vendor: 'doesNotExist' };
      const tree = buildExternalTree.call(this);

      expect(tree._inputNodes.length).to.equal(2);
    });

    it('adds vendor path, node modules and transforms to external trees', function () {
      const tree = buildExternalTree.call(this);

      expect(tree._inputNodes.length).to.equal(3);
    });
  });
});
