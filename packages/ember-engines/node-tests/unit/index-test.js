'use strict';

const EmberEngines = require('../../index');
const expect = require('chai').expect;

describe('index', function() {
  describe('updateFastBootManifest', function() {
    it('adds the node-asset-manifest to the list of vendorFiles', function() {
      const AddonClass = EmberEngines.extend({
        root: process.cwd(),
      });
      const addon = new AddonClass();
      const manifest = { vendorFiles: ['one.js', 'two.js'] };

      addon.updateFastBootManifest(manifest);

      expect(manifest).to.deep.equal({
        vendorFiles: ['one.js', 'two.js', 'assets/node-asset-manifest.js'],
      });
    });
  });
});
