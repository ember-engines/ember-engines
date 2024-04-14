'use strict';

const path = require('path');
const expect = require('chai').expect;
const Project = require('ember-cli/lib/models/project');
const MockCLI = require('ember-cli/tests/helpers/mock-cli');
const { findLCAHost } = require('../../../lib/utils/find-lca-host');

describe('Unit | find-lca-host', function () {
  const cli = new MockCLI();

  it('finds the app as the host when the project depends on a lazy engine', function () {
    const addonDir = path.resolve(
      __dirname,
      '../../fixtures/test-projects/lazy-engine-project-dep',
    );
    const packageJsonPath = path.resolve(addonDir, 'package.json');
    const project = new Project(
      addonDir,
      require(packageJsonPath),
      cli.ui,
      cli,
    );
    project.initializeAddons();

    const lazyEngine = project.addons.find(
      (addon) => addon.name === 'test-lazy-engine',
    );

    expect(lazyEngine).to.be.ok;
    expect(findLCAHost(lazyEngine)).to.equal(project.addons[0].app);

    const nestedLazyEngine = project.addons
      .find((addon) => addon.name === 'addon-depends-on-lazy-engine')
      .addons.find((addon) => addon.name === 'test-lazy-engine');

    expect(nestedLazyEngine).to.be.ok;
    expect(findLCAHost(nestedLazyEngine)).to.equal(project.addons[0].app);
  });

  it('finds the app as the host when the project transitively depends on a lazy engine', function () {
    const addonDir = path.resolve(
      __dirname,
      '../../fixtures/test-projects/transitive-lazy-engine-project-dep',
    );
    const packageJsonPath = path.resolve(addonDir, 'package.json');
    const project = new Project(
      addonDir,
      require(packageJsonPath),
      cli.ui,
      cli,
    );
    project.initializeAddons();

    const nestedLazyEngine = project.addons
      .find((addon) => addon.name === 'addon-depends-on-lazy-engine')
      .addons.find((addon) => addon.name === 'test-lazy-engine');

    expect(nestedLazyEngine).to.be.ok;
    expect(findLCAHost(nestedLazyEngine)).to.equal(project.addons[0].app);
  });

  it('finds a common lazy engine as the host', function () {
    const addonDir = path.resolve(
      __dirname,
      '../../fixtures/test-projects/common-lazy-engine-host',
    );
    const packageJsonPath = path.resolve(addonDir, 'package.json');
    const project = new Project(
      addonDir,
      require(packageJsonPath),
      cli.ui,
      cli,
    );
    project.initializeAddons();

    const projectLazyEngine = project.addons.find(
      (addon) => addon.name === 'lazy-engine-depends-on-lazy-engine',
    );

    expect(projectLazyEngine).to.be.ok;

    const nestedLazyEngine = projectLazyEngine.addons.find(
      (addon) => addon.name === 'test-lazy-engine',
    );

    expect(nestedLazyEngine).to.be.ok;
    expect(findLCAHost(nestedLazyEngine)).to.equal(projectLazyEngine);

    const deepNestedLazyEngine = projectLazyEngine.addons
      .find((addon) => addon.name === 'addon-depends-on-lazy-engine')
      .addons.find((addon) => addon.name === 'test-lazy-engine');

    expect(deepNestedLazyEngine).to.be.ok;
    expect(findLCAHost(deepNestedLazyEngine)).to.equal(projectLazyEngine);
  });
});
