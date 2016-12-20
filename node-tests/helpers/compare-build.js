var path = require('path');
var fs = require('fs-extra');
var walkSync = require('walk-sync');
var execSync = require('execa').shellSync;

function execute(command) {
  console.info('Executing: ' + command);
  return execSync(command);
}

/**
 * Builds the engine-testing application against the current upstream version
 * of ember-engines and against the current local copy. The return value is the
 * list of files produced by both outputs so that we can catch build differences
 * in testing.
 */
module.exports = function compareBuild() {
  // clone engine-testing without the full git history
  execute('git clone --depth 1 https://github.com/ember-engines/engine-testing.git');

  // link ember-engines local
  execute('npm link');

  // cd into engine-testing
  var originalCWD = process.cwd();
  var engineTestingCWD = path.join(originalCWD, 'engine-testing');

  process.chdir(engineTestingCWD);

  // install all dependencies
  execute('npm install');
  execute('bower install');

  // build against current master of ember-engines (upstream)
  execute('ember build --output-path upstream-build');

  // build against changed master of ember-engines (local)
  execute('npm link ember-engines');
  execute('ember build --output-path local-build');

  var diffProcess = execute('git diff --no-index upstream-build/ local-build/');

  process.chdir(originalCWD);

  return {
    diff: diffProcess.stdout,
    cleanup: function cleanup() {
      fs.removeSync('engine-testing');
    }
  }
};
