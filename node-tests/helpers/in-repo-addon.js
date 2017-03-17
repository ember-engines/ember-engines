var path = require('path');
var fs = require('fs-extra');
var fixturify = require('fixturify');

class InRepoAddon {
  static generate(app, name) {
    var args = [ 'generate', 'in-repo-addon', name ];
    return app.runEmberCommand(...args).then(() => {
      var addon = new InRepoAddon(app, name);
      addon.editPackageJSON(pkg => pkg.dependencies = { 'ember-cli-htmlbars': '*' });
      return addon;
    });
  }

  constructor(app, name) {
    this.app = app;
    this.path = path.join(app.path, 'lib', name);
  }

  editPackageJSON(editor) {
    var packageJSONPath = path.join(this.path, 'package.json');
    var pkg = fs.readJsonSync(packageJSONPath);
    editor(pkg);
    fs.writeJsonSync(packageJSONPath, pkg);
  }

  writeFixture(fixture) {
    fixturify.writeSync(this.path, fixture);
  }
}

module.exports = InRepoAddon;
