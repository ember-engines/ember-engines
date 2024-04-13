'use strict';

const expect = require('chai').expect;
const Addon = require('ember-cli/lib/models/addon');
const EngineAddon = require('../../../lib/engine-addon');
const deeplyNonDuplicatedAddon = require('../../../lib/utils/deeply-non-duplicated-addon');

describe('deeplyNonDuplicatedAddon', function () {
  let NestedAddonConstructor, LazyEngineConstructor, hostAddons, lazyEngine;

  beforeEach(function () {
    NestedAddonConstructor = Addon.extend({
      root: 'foo',
      name: 'nested',
    });

    LazyEngineConstructor = Addon.extend(
      Object.assign(
        {
          root: 'foo',
          name: 'lazy',
          lazyLoading: { enabled: true },
        },
        EngineAddon,
      ),
    );

    hostAddons = {
      nested: new NestedAddonConstructor(),
    };

    lazyEngine = new LazyEngineConstructor();
  });

  it('deduplicates children addons from hostAddons', function () {
    let CommonAddonConstructor = Addon.extend({
      root: 'foo',
      name: 'common',
    });

    let commonAddon = new CommonAddonConstructor();
    let commonAddonAddons = [new NestedAddonConstructor()];
    commonAddon.addons = commonAddonAddons;

    lazyEngine.addons = [commonAddon];

    deeplyNonDuplicatedAddon(hostAddons, lazyEngine, 'addon');

    expect(commonAddon.addons.length).to.equal(0);
    expect(commonAddon._orginalAddons).to.equal(commonAddonAddons);
  });

  it('does not deduplicate children lazy engine addons from hostAddons', function () {
    let NestedLazyEngineConstructor = Addon.extend(
      Object.assign(
        {
          root: 'foo',
          name: 'lazy-in-lazy',
          lazyLoading: { enabled: true },
        },
        EngineAddon,
      ),
    );

    let nestedLazyEngine = new NestedLazyEngineConstructor();
    let nestedLazyEngineAddons = [new NestedAddonConstructor()];
    nestedLazyEngine.addons = nestedLazyEngineAddons;

    lazyEngine.addons = [nestedLazyEngine];

    deeplyNonDuplicatedAddon(hostAddons, lazyEngine, 'addon');

    expect(nestedLazyEngine.addons).to.equal(nestedLazyEngineAddons);
    expect(nestedLazyEngine._orginalAddons).to.be.undefined;
  });
});
