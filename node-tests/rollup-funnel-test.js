var fs = require('fs-extra');
var path = require('path');
var assert = require('assert');
var fixturify = require('fixturify');
var broccoli = require('broccoli-builder');
var walkSync = require('walk-sync');
var Promise = require('es6-promise').Promise;
var RollupFunnel = require('../lib/rollup-funnel');

// Some filesystems dont have lower then 1s mtime resolution
function fsTick() {
  return new Promise(function(resolve) {
    setTimeout(resolve, 1001);
  });
};

// Helper to assert that two stats are equal, but only in the ways we care about.
// Helpful because atime is finicky.
function assertStatEqual(a, b) {
  assert.equal(a.mtime.toString(), b.mtime.toString());
  assert.equal(a.mode, b.mode);
  assert.equal(a.size, b.size);
}

// Helper to assert that a file did change. We really only care that mtime changed.
function assertStatChange(a, b) {
  assert.notEqual(a.mtime.toString(), b.mtime.toString());
}

describe('RollupFunnel', function() {
  this.timeout(5000);

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

  describe('rebuild', function() {
    it('is stable on unchanged rebuild with include', function() {
      var buildStat;
      var rollupFunnel = new RollupFunnel(fixtureDir, {
        include: true,
        rollup: {
          entry: 'routes.js',
          external: [ 'ember-engines/routes' ]
        }
      });

      builder = new broccoli.Builder(rollupFunnel);
      return builder.build().then(function(result) {
        buildStat = fs.statSync(result.directory);
        return fsTick();
      }).then(function() {
        return builder.build();
      }).then(function(result) {
        var rebuildStat = fs.statSync(result.directory);
        assertStatEqual(rebuildStat, buildStat);
      });
    });

    it('is stable on unchanged rebuild with exclude', function() {
      var buildStat;
      var rollupFunnel = new RollupFunnel(fixtureDir, {
        exclude: true,
        rollup: {
          entry: 'routes.js',
          external: [ 'ember-engines/routes' ]
        }
      });

      builder = new broccoli.Builder(rollupFunnel);
      return builder.build().then(function(result) {
        buildStat = fs.statSync(result.directory);
        return fsTick();
      }).then(function() {
        return builder.build();
      }).then(function(result) {
        var rebuildStat = fs.statSync(result.directory);
        assertStatEqual(rebuildStat, buildStat);
      });
    });

    it('is stable when changes occur outside dep graph and using include', function() {
      var buildStat;
      var rollupFunnel = new RollupFunnel(fixtureDir, {
        include: true,
        rollup: {
          entry: 'routes.js',
          external: [ 'ember-engines/routes' ]
        }
      });

      builder = new broccoli.Builder(rollupFunnel);
      return builder.build().then(function(result) {
        buildStat = fs.statSync(result.directory);
        return fsTick();
      }).then(function() {
        fixturify.writeSync(fixtureDir, {
          'engine.js': ''
        });

        return builder.build();
      }).then(function(result) {
        var rebuildStat = fs.statSync(result.directory);
        assertStatEqual(rebuildStat, buildStat, 'stable rebuild when modifying file NOT in dep graph');
      });
    });

    it('updates when changes occur in dep graph and using include', function() {
      var buildStat;
      var rollupFunnel = new RollupFunnel(fixtureDir, {
        include: true,
        rollup: {
          entry: 'routes.js',
          external: [ 'ember-engines/routes' ]
        }
      });

      builder = new broccoli.Builder(rollupFunnel);
      return builder.build().then(function(result) {
        buildStat = fs.statSync(result.directory);

        var output = walkSync(result.directory);
        assert.deepEqual(output, [ 'routes.js', 'utils/', 'utils/derp.js', 'utils/foo.js' ], 'output for build is correct');

        return fsTick();
      }).then(function() {
        fixturify.writeSync(fixtureDir, {
          'routes.js': 'import herp from "utils/herp";'
        });

        return builder.build();
      }).then(function(result) {
        var rebuildStat = fs.statSync(result.directory);
        assertStatChange(rebuildStat, buildStat, 'instable rebuild when modifying file in dep graph');

        var output = walkSync(result.directory);
        assert.deepEqual(output, [ 'routes.js', 'utils/', 'utils/herp.js' ], 'output for rebuild is correct');
      });
    });

    it('updates when changes occur outside dep graph and using exclude', function() {
      var engineStat, routesStat;
      var rollupFunnel = new RollupFunnel(fixtureDir, {
        exclude: true,
        rollup: {
          entry: 'routes.js',
          external: [ 'ember-engines/routes' ]
        }
      });

      builder = new broccoli.Builder(rollupFunnel);
      return builder.build().then(function(result) {
        engineStat = fs.statSync(result.directory + '/engine.js');
        routesStat = fs.statSync(result.directory + '/utils/herp.js');

        return fsTick();
      }).then(function() {
        fixturify.writeSync(fixtureDir, {
          'engine.js': ''
        });

        return builder.build();
      }).then(function(result) {
        var engineRebuildStat = fs.statSync(result.directory + '/engine.js');
        assertStatChange(engineStat, engineRebuildStat, 'engine.js changed');

        var routesRebuildStat = fs.statSync(result.directory + '/utils/herp.js');
        assertStatEqual(routesStat, routesRebuildStat, 'routes.js unchanged');

        return fsTick();
      }).then(function() {
        fs.unlink(path.join(fixtureDir, 'engine.js'));

        return builder.build();
      }).then(function(result) {
        assert.ok(!fs.existsSync(result.directory + '/engine.js'));

        var routesRebuildStat = fs.statSync(result.directory + '/utils/herp.js');
        assertStatEqual(routesStat, routesRebuildStat, 'routes.js unchanged second time');
      });
    });

    it('updates when changes occur in dep graph and using exclude', function() {
      var buildStat;
      var rollupFunnel = new RollupFunnel(fixtureDir, {
        exclude: true,
        rollup: {
          entry: 'routes.js',
          external: [ 'ember-engines/routes' ]
        }
      });

      builder = new broccoli.Builder(rollupFunnel);
      return builder.build().then(function(result) {
        buildStat = fs.statSync(result.directory);

        var output = walkSync(result.directory);
        assert.deepEqual(output, [ 'engine.js', 'utils/', 'utils/herp.js' ], 'output for build is correct');

        return fsTick();
      }).then(function() {
        fixturify.writeSync(fixtureDir, {
          'routes.js': 'import herp from "utils/herp";'
        });

        return builder.build();
      }).then(function(result) {
        var rebuildStat = fs.statSync(result.directory);
        assertStatChange(rebuildStat, buildStat, 'instable rebuild when modifying file in dep graph');

        var output = walkSync(result.directory);
        assert.deepEqual(output, [ 'engine.js', 'utils/', 'utils/derp.js', 'utils/foo.js' ], 'output for rebuild is correct');
      });
    });
  });
});
