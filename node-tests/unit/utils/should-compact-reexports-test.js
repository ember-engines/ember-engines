const path = require('path');
const expect = require('chai').expect;
const shouldCompactReexports = require('../../../lib/utils/should-compact-reexports');

describe('shouldCompactReexports', function() {
  const fixturePath = path.resolve(__dirname, '../../fixtures/should-compact-reexports');
  let addon;

  function FakeAddonWithDeps() {
    this.name = 'fake-addon-with-deps';
    this.project = {
      root: path.join(fixturePath, 'correct')
    };
  }

  beforeEach(function() {
    addon = new FakeAddonWithDeps();
  });

  it('returns true with recent versions of ember-cli-babel, ember-cli, and loader.js', function() {
    expect(shouldCompactReexports(addon)).to.equal(true);
  });

  it('returns false when the version of ember-cli-babel is < 6.0.0', function() {
    addon.root = path.join(fixturePath, 'old-ember-cli-babel');
    expect(shouldCompactReexports(addon)).to.equal(false);
  });

  it('returns false when the version of ember-cli is < 2.13.0', function() {
    addon.root = path.join(fixturePath, 'old-ember-cli')
    expect(shouldCompactReexports(addon)).to.equal(false);
  });

  it('returns false when the version of loader.js is < 4.4.0', function() {
    addon.root = path.join(fixturePath, 'old-loader')
    expect(shouldCompactReexports(addon)).to.equal(false);
  });
});
