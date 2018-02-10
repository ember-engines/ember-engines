'use strict';

const EngineAddon = require('../../lib/engine-addon');
const expect = require('chai').expect;

describe('engine-addon', function() {
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
