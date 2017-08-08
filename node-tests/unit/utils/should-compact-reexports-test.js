'use strict';

const co = require('co');
const expect = require('chai').expect;
const createTempDir = require('broccoli-test-helper').createTempDir;
const shouldCompactReexports = require('../../../lib/utils/should-compact-reexports');

describe('shouldCompactReexports', function() {
  let fixture;

  function FakeAddonWithDeps(fixture, dependencies) {
    this.name = 'fake-addon-with-deps';
    this.root = fixture.path('node_modules/fake-addon-with-deps');

    let nodeModules = Object.keys(dependencies).reduce((modules, key) => {
      modules[key] = {
        'package.json': `{
          "name": "${key}",
          "version": "${dependencies[key]}"
        }`
      };

      return modules;
    }, {});

    fixture.write({
      'node_modules': nodeModules
    });
  }

  beforeEach(co.wrap(function* () {
    fixture = yield createTempDir();
  }));

  afterEach(function() {
    return fixture.dispose();
  })

  it('returns true with recent versions of ember-cli-babel, ember-cli, and loader.js', function() {
    let addon = new FakeAddonWithDeps(fixture, {
      'ember-cli': '2.13.0',
      'ember-cli-babel': '6.0.0',
      'loader.js': '4.4.0'
    });

    expect(shouldCompactReexports(addon)).to.equal(true);
  });

  it('returns false when the version of ember-cli-babel is < 6.0.0', function() {
    let addon = new FakeAddonWithDeps(fixture, {
      'ember-cli': '2.13.0',
      'ember-cli-babel': '5.0.0',
      'loader.js': '4.4.0'
    });
    expect(shouldCompactReexports(addon)).to.equal(false);
  });

  it('returns false when the version of ember-cli is < 2.13.0', function() {
    let addon = new FakeAddonWithDeps(fixture, {
      'ember-cli': '2.12.0',
      'ember-cli-babel': '6.0.0',
      'loader.js': '4.4.0'
    });
    expect(shouldCompactReexports(addon)).to.equal(false);
  });

  it('returns false when the version of loader.js is < 4.4.0', function() {
    let addon = new FakeAddonWithDeps(fixture, {
      'ember-cli': '2.13.0',
      'ember-cli-babel': '6.0.0',
      'loader.js': '4.3.0'
    });
    expect(shouldCompactReexports(addon)).to.equal(false);
  });
});
