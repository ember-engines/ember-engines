'use strict';

const path = require('path');
const fixturify = require('fixturify');
const walkSync = require('walk-sync');

class BuildOutput {
  constructor(cwd) {
    this.cwd = cwd;
    this._buildPath = path.join(cwd, 'dist');
    this._build = fixturify.readSync(this._buildPath);
  }

  doesNotContain(file, matcher) {
    try {
      this.contains(file, matcher);
    } catch (e) {
      return true;
    }

    if (arguments.length === 1) {
      throw new Error(
        `Expected file "${file}" to NOT be found in the build output, but it was.`,
      );
    } else {
      throw new Error(
        `Expected file "${file}" to NOT match "${matcher}", but it did.`,
      );
    }
  }

  contains(file, matcher) {
    let fileContents = this.file(file);

    if (matcher && !matcher.test(fileContents)) {
      throw new Error(
        `Expected file "${file}" to match "${matcher}", but it was not found.`,
      );
    }

    return true;
  }

  files() {
    return walkSync(this._buildPath, { directories: false });
  }

  test() {
    return this.app.runEmberCommand('test', '--path', this._buildPath);
  }

  file(file) {
    let fileParts = file.split('/');
    let result = this._build;

    while (fileParts.length && result != undefined) {
      result = result[fileParts.shift()];
    }

    if (result == undefined) {
      throw new Error(`The file "${file}" was not found in the build output.`);
    }

    return result;
  }

  manifest() {
    return JSON.parse(this.file('asset-manifest.json'));
  }
}

module.exports = async function build(cwd, _environment) {
  let environment = _environment || 'development';

  const { execa } = await import('execa');

  await execa('ember', ['build', '--environment', environment], { cwd });

  return new BuildOutput(cwd);
};
