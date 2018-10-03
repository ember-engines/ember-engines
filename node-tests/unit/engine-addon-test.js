'use strict';

const EngineAddon = require('../../lib/engine-addon');
const expect = require('chai').expect;
const path = require('path');

describe('engine-addon', function() {
  describe('engineConfig', function() {
    it('caches per environment', function() {
      // TODO: EngineAddon is crazy, it will need to be refactored to cleanup this test
      const addon = EngineAddon.extend({
        name: 'testing',
        // eslint-disable-next-line ember/avoid-leaking-state-in-ember-objects
        lazyLoading: { enabled: true }
      });
      addon.pkg = {};
      addon.root = path.join(__dirname, '../fixtures/engine-config/');
      addon._engineConfig = new Map();
      addon.initializeAddons = function () { };
      addon.addons = [];

      expect(addon.engineConfig()).to.eql({ env: undefined });
      expect(addon.engineConfig('test')).to.eql({ env: "test" });
      expect(addon.engineConfig('bar')).to.eql({ env: "bar" });
      expect(addon.engineConfig('test')).to.eql({ env: "test" });
      expect(addon.engineConfig('bar')).to.eql({ env: "bar" });

      expect(addon.engineConfig('test')).to.eql(addon.engineConfig('test'));
      expect(addon.engineConfig('bar')).to.eql(addon.engineConfig('bar'));
    });
  });

  describe('updateFastBootManifest', function() {
    it('adds necessary vendorFiles to the manifest when lazyLoading is enabled', function() {
      const addon = EngineAddon.extend({
        name: 'testing',
        // eslint-disable-next-line ember/avoid-leaking-state-in-ember-objects
        lazyLoading: { enabled: true }
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

    it('add config/environment file to the manifest when lazyLoading is disabled', function() {
      const addon = EngineAddon.extend({
        name: 'testing',
        // eslint-disable-next-line ember/avoid-leaking-state-in-ember-objects
        lazyLoading: { enabled: false }
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
});
