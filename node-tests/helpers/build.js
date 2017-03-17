var path = require('path');
var fixturify = require('fixturify');
var walkSync = require('walk-sync');

class BuildOutput {
  constructor(app) {
    this.app = app;
    this._buildPath = path.join(app.path, 'dist');
    this._build = fixturify.readSync(this._buildPath);
  }

  contains(file, matcher) {
    var fileParts = file.split('/');
    var result = this._build;

    while (fileParts.length && result != undefined) {
      result = result[fileParts.shift()];
    }

    if (result == undefined) {
      throw new Error(`The file "${file}" was not found in the build output.`);
    } else if (matcher && !matcher.test(result)) {
      throw new Error(`Expected file "${file}" to match "${matcher}", but it was not found.`);
    }

    return true;
  }

  files() {
    return walkSync(this._buildPath, { directories: false });
  }

  test() {
    return this.app.runEmberCommand('test', '--path', this._buildPath);
  }
}

function build(app) {
  return app.runEmberCommand('build').then(() => {
    return new BuildOutput(app);
  });
}

module.exports = build;