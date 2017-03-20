'use strict';

const path = require('path');
const fs = require('fs-extra');
const fixturify = require('fixturify');

class InRepoAddon {
  static generate(app, name) {
    let args = [ 'generate', 'in-repo-addon', name ];
    return app.runEmberCommand.apply(app, args).then(() => {
      let addon = new InRepoAddon(app, name);
      addon.editPackageJSON((pkg) => pkg.dependencies = { 'ember-cli-htmlbars': '*' });
      return addon;
    });
  }

  constructor(app, name) {
    this.name = name;
    this.app = app;
    this.path = path.join(app.path, 'lib', name);
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
}

module.exports = InRepoAddon;
