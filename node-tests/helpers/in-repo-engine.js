'use strict';

const InRepoAddon = require('./in-repo-addon');

class InRepoEngine extends InRepoAddon {
  static generate(app, name, options) {
    let args = ['generate', 'in-repo-engine', name];

    if (typeof options.lazy !== 'undefined') {
      args.push('--lazy', options.lazy);
    }

    if (typeof options.type !== 'undefined') {
      args.push('--type', options.type);
    }

    return app.runEmberCommand.apply(app, args).then(() => {
      let engine = new InRepoEngine(app, name);
      // Set up a simple default CSS file
      engine.writeFixture({
        addon: {
          styles: {
            'app.css': `/* ${name}.css */`,
          },
        },
      });
      return engine;
    });
  }

  generateNestedEngine(name) {
    // Generate another in-repo-engine at the app level...
    let args = Array.prototype.slice.call(arguments);
    args.unshift(this.app);
    return InRepoEngine.generate.apply(null, args).then(engine => {
      // Remove the in-repo-engine from the app...
      this.app.editPackageJSON(pkg => {
        pkg['ember-addon'].paths = pkg['ember-addon'].paths.filter(
          path => path !== `lib/${name}`
        );
      });

      // Add the in-repo-engine to this engine.
      this.editPackageJSON(pkg => {
        pkg['ember-addon'] = pkg['ember-addon'] || {};
        pkg['ember-addon'].paths = pkg['ember-addon'].paths || [];
        pkg['ember-addon'].paths.push(`../${name}`);
      });

      return engine;
    });
  }
}

module.exports = InRepoEngine;
