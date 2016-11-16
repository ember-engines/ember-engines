var fs = require('fs-extra');
var assert = require('assert');
var fixturify = require('fixturify');
var broccoli = require('broccoli-builder');
var walkSync = require('walk-sync');
var RollupFunnel = require('../lib/rollup-funnel');

describe('RollupFunnel', function() {
  var fixtureDir = 'tmp/fixture';
  var builder;

  beforeEach(function() {
    fs.mkdirpSync(fixtureDir);
    fixturify.writeSync(fixtureDir, {
      'routes.js': 'import buildRoutes from "ember-engines/routes";import foo from "utils/foo";',
      'utils': {
        'foo.js': 'import derp from "./derp";',
        'derp.js': '',
        'herp.js': ''
      },
      'engine.js': 'import herp from "./utils/herp"'
    });
  });

  afterEach(function() {
    fs.removeSync(fixtureDir);
    return builder.cleanup().then(function() {
      builder = undefined;
    });
  });

  describe('build', function() {
    it('returns a tree of the dependency graph when using include', function() {
      var rollupFunnel = new RollupFunnel(fixtureDir, {
        include: true,
        rollup: {
          entry: 'routes.js',
          external: [ 'ember-engines/routes' ]
        }
      });

      builder = new broccoli.Builder(rollupFunnel);

      return builder.build().then(function(result) {
        var output = walkSync(result.directory);
        assert.deepEqual(output, [ 'routes.js', 'utils/', 'utils/derp.js', 'utils/foo.js' ]);
      });
    });

    it('returns a tree excluding the dependency graph when using exclude', function() {
      var rollupFunnel = new RollupFunnel(fixtureDir, {
        exclude: true,
        rollup: {
          entry: 'routes.js',
          external: [ 'ember-engines/routes' ]
        }
      });

      builder = new broccoli.Builder(rollupFunnel);

      return builder.build().then(function(result) {
        var output = walkSync(result.directory);
        assert.deepEqual(output, [ 'engine.js', 'utils/', 'utils/herp.js' ]);
      });
    });
  });
});
