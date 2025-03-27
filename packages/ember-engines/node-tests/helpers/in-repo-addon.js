'use strict';

const path = require('path');
const fs = require('fs-extra');
const fixturify = require('fixturify');

module.exports = class InRepoAddon {
  static async generate(cwd, name) {
    const { execa } = await import('execa');

    let args = ['generate', 'in-repo-addon', name];

    await execa('ember', args, { cwd });

    let addon = new InRepoAddon(cwd, name);
    addon.editPackageJSON(
      (pkg) => (pkg.dependencies = { 'ember-cli-htmlbars': '*' }),
    );
    return addon;
  }

  constructor(cwd, name) {
    this.name = name;
    this.cwd = cwd;
    this.path = path.join(cwd, 'lib', name);
  }

  editAppPackageJSON(editor) {
    let packageJSONPath = path.join(this.cwd, 'package.json');
    let pkg = fs.readJsonSync(packageJSONPath);
    editor(pkg);
    fs.writeJsonSync(packageJSONPath, pkg);
  }

  editPackageJSON(editor) {
    let packageJSONPath = path.join(this.path, 'package.json');
    let pkg = fs.readJsonSync(packageJSONPath);
    editor(pkg);
    fs.writeJsonSync(packageJSONPath, pkg);
  }

  writeFixture(fixture) {
    fixturify.writeSync(this.path, fixture);
  }

  nest(addon) {
    this.editPackageJSON((pkg) => {
      pkg['ember-addon'] = pkg['ember-addon'] || {};
      pkg['ember-addon'].paths = pkg['ember-addon'].paths || [];
      pkg['ember-addon'].paths.push(`../${addon.name}`);
    });
  }

  generateNestedAddon(name) {
    // Generate another in-repo-addon at the app level...
    let args = Array.prototype.slice.call(arguments);
    args.unshift(this.cwd);
    return InRepoAddon.generate.apply(null, args).then((addon) => {
      // Remove the in-repo-addon from the app...
      this.editAppPackageJSON((pkg) => {
        pkg['ember-addon'].paths = pkg['ember-addon'].paths.filter(
          (path) => path !== `lib/${name}`,
        );
      });

      // Add the in-repo-addon to this engine.
      this.editPackageJSON((pkg) => {
        pkg['ember-addon'] = pkg['ember-addon'] || {};
        pkg['ember-addon'].paths = pkg['ember-addon'].paths || [];
        pkg['ember-addon'].paths.push(`../${name}`);
      });

      return addon;
    });
  }
};
