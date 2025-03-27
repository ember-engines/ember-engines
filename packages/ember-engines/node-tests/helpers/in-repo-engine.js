'use strict';

const InRepoAddon = require('./in-repo-addon');

module.exports = class InRepoEngine extends InRepoAddon {
  static async generate(cwd, name, options) {
    const { execa } = await import('execa');

    let args = ['generate', 'in-repo-engine', name];

    if (typeof options.lazy !== 'undefined') {
      args.push('--lazy', options.lazy);
    }

    if (typeof options.type !== 'undefined') {
      args.push('--type', options.type);
    }

    await execa('ember', args, { cwd });

    let engine = new InRepoEngine(cwd, name);
    // Set up a simple default CSS file
    engine.writeFixture({
      addon: {
        styles: {
          'app.css': `/* ${name}.css */`,
        },
      },
    });
    return engine;
  }

  generateNestedEngine(name) {
    // Generate another in-repo-engine at the app level...
    let args = Array.prototype.slice.call(arguments);
    args.unshift(this.cwd);

    return InRepoEngine.generate.apply(this.cwd, args).then((engine) => {
      // Remove the in-repo-engine from the app...
      this.editAppPackageJSON((pkg) => {
        pkg['ember-addon'].paths = pkg['ember-addon'].paths.filter(
          (path) => path !== `lib/${name}`,
        );
      });

      // Add the in-repo-engine to this engine.
      this.editPackageJSON((pkg) => {
        pkg['ember-addon'] = pkg['ember-addon'] || {};
        pkg['ember-addon'].paths = pkg['ember-addon'].paths || [];
        pkg['ember-addon'].paths.push(`../${name}`);
      });

      return engine;
    });
  }
};
