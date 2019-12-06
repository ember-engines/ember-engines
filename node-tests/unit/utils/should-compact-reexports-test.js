'use strict';

const expect = require('chai').expect;
const createTempDir = require('broccoli-test-helper').createTempDir;
const shouldCompactReexports = require('../../../lib/utils/should-compact-reexports');

describe('shouldCompactReexports', function() {
  let fixture;
  let options = {
    "ember-cli-babel": {
      compileModules: true
    }
  }

  function FakeAddonWithDeps(fixture, dependencies) {
    this.name = 'fake-addon-with-deps';
    this.root = fixture.path('node_modules/fake-addon-with-deps');

    let nodeModules = Object.keys(dependencies).reduce((modules, key) => {
      modules[key] = {
        'package.json': `{
          "name": "${key}",
          "version": "${dependencies[key]}"
        }`,
      };

      return modules;
    }, {});

    fixture.write({
      node_modules: nodeModules,
    });
  }

  beforeEach(async function() {
    fixture = await createTempDir();
  });

  afterEach(function() {
    return fixture.dispose();
  });

  it('returns true with recent versions of ember-cli-babel, ember-cli, and loader.js', function() {
    let addon = new FakeAddonWithDeps(fixture, {
      'ember-cli': '2.13.0',
      'ember-cli-babel': '6.0.0',
      'loader.js': '4.4.0',
    });

    expect(shouldCompactReexports(addon, options)).to.equal(true);
  });

  it('returns false when the version of ember-cli-babel is < 6.0.0', function() {
    let addon = new FakeAddonWithDeps(fixture, {
      'ember-cli': '2.13.0',
      'ember-cli-babel': '5.0.0',
      'loader.js': '4.4.0',
    });
    expect(shouldCompactReexports(addon, options)).to.equal(false);
  });

  it('returns false when the version of ember-cli is < 2.13.0', function() {
    let addon = new FakeAddonWithDeps(fixture, {
      'ember-cli': '2.12.0',
      'ember-cli-babel': '6.0.0',
      'loader.js': '4.4.0',
    });
    expect(shouldCompactReexports(addon, options)).to.equal(false);
  });

  it('returns false when the version of ember-cli is < 3.4.0-beta.2', function() {
    let addon = new FakeAddonWithDeps(fixture, {
      'ember-cli': '3.4.0-beta.2',
      'ember-cli-babel': '6.0.0',
      'loader.js': '4.4.0',
    });
    expect(shouldCompactReexports(addon, options)).to.equal(true);
  });

  it('returns true when the version of ember-cli-babel is  7.0.0-beta.1', function() {
    let addon = new FakeAddonWithDeps(fixture, {
      'ember-cli': '3.3.0',
      'ember-cli-babel': '7.0.0-beta.1',
      'loader.js': '4.4.0',
    });
    expect(shouldCompactReexports(addon, options)).to.equal(true);
  });

  it('returns false when the version of loader.js is < 4.4.0', function() {
    let addon = new FakeAddonWithDeps(fixture, {
      'ember-cli-babel': '6.0.0',
      'loader.js': '4.3.0',
    });
    expect(shouldCompactReexports(addon, options)).to.equal(false);
  });

  it('returns false when compileModules: false', function() {
    let addon = new FakeAddonWithDeps(fixture, {
      'ember-cli': '3.3.0',
      'ember-cli-babel': '7.0.0-beta.1',
      'loader.js': '4.4.0',
    });
    expect(
      shouldCompactReexports(addon, {
        "ember-cli-babel": { compileModules: false }
      })
    ).to.equal(false);
  }),

  it('returns false if Embroider is a dependency', function() {
    let addon = new FakeAddonWithDeps(fixture, {
      'ember-cli': '3.3.0',
      'ember-cli-babel': '7.0.0-beta.1',
      'loader.js': '4.4.0',
      'embroider': 'latest'
    });

    expect(shouldCompactReexports(addon, options)).to.equal(false);
  });
});
