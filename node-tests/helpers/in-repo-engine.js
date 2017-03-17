var path = require('path');
var fs = require('fs-extra');
var fixturify = require('fixturify');
var InRepoAddon = require('./in-repo-addon');

class InRepoEngine extends InRepoAddon {
  static generate(app, name, options) {
    var args = [ 'generate', 'in-repo-engine', name ];

    if (typeof options.lazy !== 'undefined') {
      args.push('--lazy', options.lazy);
    }

    if (typeof options.type !== 'undefined') {
      args.push('--type', options.type);
    }

    return app.runEmberCommand(...args).then(() => {
      return new InRepoEngine(app, name);
    });
  }

  generateNestedEngine(name) {
    // Generate another in-repo-engine at the app level...
    return InRepoEngine.generate(this.app, ...arguments).then(engine => {
      // Remove the in-repo-engine from the app...
      this.app.editPackageJSON(pkg => {
        pkg['ember-addon'].paths = pkg['ember-addon'].paths.filter(path => path !== `lib/${name}`);
      });

      // Add the in-repo-engine to this engine.
      this.editPackageJSON(pkg => {
        pkg['ember-addon'] = {
          paths: [
            `../${name}`
          ]
        };
      });

      return engine;
    });
  }

  generateNestedAddon(name) {
    // Generate another in-repo-addon at the app level...
    return InRepoAddon.generate(this.app, ...arguments).then(addon => {
      // Remove the in-repo-addon from the app...
      this.app.editPackageJSON(pkg => {
        pkg['ember-addon'].paths = pkg['ember-addon'].paths.filter(path => path !== `lib/${name}`);
      });

      // Add the in-repo-addon to this engine.
      this.editPackageJSON(pkg => {
        pkg['ember-addon'] = {
          paths: [
            `../${name}`
          ]
        };
      });

      return addon;
    });
  }
}

module.exports = InRepoEngine;
