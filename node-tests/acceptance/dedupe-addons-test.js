'use strict';

const co = require('co');
const AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;

const build = require('../helpers/build');
const InRepoAddon = require('../helpers/in-repo-addon');
const InRepoEngine = require('../helpers/in-repo-engine');
const matchers = require('../helpers/matchers');

const moduleMatcher = matchers.module;
const reexportMatcher = matchers.reexport;
const cssCommentMatcher = matchers.cssComment;

describe('Acceptance', function() {
  describe('dedupe addons', function() {
    this.timeout(300000);

    it('in lazy engines that are direct dependencies of the engine', co.wrap(function* () {
      let app = new AddonTestApp();
      let appName = 'engine-testing';
      let engineName = 'lazy';
      let addonName = 'nested';

      yield app.create(appName, { noFixtures: true });
      let addon = yield InRepoAddon.generate(app, addonName);
      let engine = yield InRepoEngine.generate(app, engineName, { lazy: true });

      engine.nest(addon);

      addon.writeFixture({
        app: {
          'foo.js': `export { default } from 'nested/components/foo';`
        },
        addon: {
          styles: {
            'addon.css': `/* ${addonName}.css */`
          },
          components: {
            'foo.js': `export default {}`
          },
          templates: {
            components: {
              'foo.hbs': `<h1>foo</h1>`
            }
          }
        },
        public: {
          'some-file.txt': `some file`
        }
      });

      let output = yield build(app);

      // Verify all the files are in the host's assets
      output.contains(`assets/${appName}.js`, moduleMatcher(`${appName}/foo`));
      output.contains('nested/some-file.txt');
      output.contains('assets/vendor.js', moduleMatcher(`${addonName}/components/foo`));
      output.contains('assets/vendor.js', moduleMatcher(`${addonName}/templates/components/foo`));
      output.contains('assets/vendor.css', cssCommentMatcher(`${addonName}.css`));

      // App folder should still be merged into the Engine's namespace
      output.contains(`engines-dist/${engineName}/assets/engine.js`, reexportMatcher(`${addonName}/components/foo`, `${engineName}/foo`));

      // All other files should not be included
      output.doesNotContain(`engines-dist/${engineName}/nested/some-file.txt`);
      output.doesNotContain(`engines-dist/${engineName}/assets/engine-vendor.js`, moduleMatcher(`${addonName}/components/foo`));
      output.doesNotContain(`engines-dist/${engineName}/assets/engine-vendor.js`, moduleMatcher(`${addonName}/templates/components/foo`));
      output.doesNotContain(`engines-dist/${engineName}/assets/engine-vendor.css`, cssCommentMatcher(`${addonName}.css`));
    }));

    it.skip('in lazy engines that are nested dependencies of the engine', co.wrap(function* () {
      let app = new AddonTestApp();
      let appName = 'engine-testing';
      let engineName = 'lazy';
      let engineAddonName = 'addon-in-lazy';
      let addonName = 'nested';

      yield app.create(appName, { noFixtures: true });
      let addon = yield InRepoAddon.generate(app, addonName);
      let engine = yield InRepoEngine.generate(app, engineName, { lazy: true });
      let engineAddon = yield engine.generateNestedAddon(engineAddonName, { lazy: true });

      engineAddon.nest(addon);

      addon.writeFixture({
        app: {
          'foo.js': `export { default } from 'nested/components/foo';`
        },
        addon: {
          styles: {
            'addon.css': `/* ${addonName}.css */`
          },
          components: {
            'foo.js': `export default {}`
          },
          templates: {
            components: {
              'foo.hbs': `<h1>foo</h1>`
            }
          }
        },
        public: {
          'some-file.txt': `some file`
        }
      });

      let output = yield build(app);

      // Verify all the files are in the host's assets
      output.contains(`assets/${appName}.js`, moduleMatcher(`${appName}/foo`));
      output.contains('nested/some-file.txt');
      output.contains('assets/vendor.js', moduleMatcher(`${addonName}/components/foo`));
      output.contains('assets/vendor.js', moduleMatcher(`${addonName}/templates/components/foo`));
      output.contains('assets/vendor.css', cssCommentMatcher(`${addonName}.css`));

      // App folder should still be merged into the Engine's namespace
      output.contains(`engines-dist/${engineName}/assets/engine.js`, moduleMatcher(`${engineName}/foo`));

      // All other files should not be included
      output.doesNotContain(`engines-dist/${engineName}/nested/some-file.txt`);
      output.doesNotContain(`engines-dist/${engineName}/assets/engine-vendor.js`, moduleMatcher(`${addonName}/components/foo`));
      output.doesNotContain(`engines-dist/${engineName}/assets/engine-vendor.js`, moduleMatcher(`${addonName}/templates/components/foo`));
      output.doesNotContain(`engines-dist/${engineName}/assets/engine-vendor.css`, cssCommentMatcher(`${addonName}.css`));
    }));

    it('in deeply nested lazy engines that appear in host application', co.wrap(function* () {
      let app = new AddonTestApp();
      let appName = 'engine-testing';
      let engineName = 'lazy';
      let nestedEngineName = 'lazy-in-lazy';
      let addonName = 'nested';

      yield app.create(appName, { noFixtures: true });
      let addon = yield InRepoAddon.generate(app, addonName);
      let engine = yield InRepoEngine.generate(app, engineName, { lazy: true });
      let nestedEngine = yield engine.generateNestedEngine(nestedEngineName, { lazy: true });

      nestedEngine.nest(addon);

      addon.writeFixture({
        app: {
          'foo.js': `export { default } from 'nested/components/foo';`
        },
        addon: {
          styles: {
            'addon.css': `/* ${addonName}.css */`
          },
          components: {
            'foo.js': `export default {}`
          },
          templates: {
            components: {
              'foo.hbs': `<h1>foo</h1>`
            }
          }
        },
        public: {
          'some-file.txt': `some file`
        }
      });

      let output = yield build(app);

      // Verify all the files are in the host's assets
      output.contains(`assets/${appName}.js`, moduleMatcher(`${appName}/foo`));
      output.contains('nested/some-file.txt');
      output.contains('assets/vendor.js', moduleMatcher(`${addonName}/components/foo`));
      output.contains('assets/vendor.js', moduleMatcher(`${addonName}/templates/components/foo`));
      output.contains('assets/vendor.css', cssCommentMatcher(`${addonName}.css`));

      // App folder should still be merged into the Engine's namespace
      output.doesNotContain(`engines-dist/${engineName}/assets/engine.js`, reexportMatcher(`${addonName}/components/foo`, `${engineName}/foo`));
      output.contains(`engines-dist/${nestedEngineName}/assets/engine.js`, reexportMatcher(`${addonName}/components/foo`, `${nestedEngineName}/foo`));

      // All other files should not be included
      output.doesNotContain(`engines-dist/${engineName}/nested/some-file.txt`);
      output.doesNotContain(`engines-dist/${engineName}/assets/engine-vendor.js`, moduleMatcher(`${addonName}/components/foo`));
      output.doesNotContain(`engines-dist/${engineName}/assets/engine-vendor.js`, moduleMatcher(`${addonName}/templates/components/foo`));
      output.doesNotContain(`engines-dist/${engineName}/assets/engine-vendor.css`, cssCommentMatcher(`${addonName}.css`));

      output.doesNotContain(`engines-dist/${nestedEngineName}/nested/some-file.txt`);
      output.doesNotContain(`engines-dist/${nestedEngineName}/assets/engine-vendor.js`, moduleMatcher(`${addonName}/components/foo`));
      output.doesNotContain(`engines-dist/${nestedEngineName}/assets/engine-vendor.js`, moduleMatcher(`${addonName}/templates/components/foo`));
      output.doesNotContain(`engines-dist/${nestedEngineName}/assets/engine-vendor.css`, cssCommentMatcher(`${addonName}.css`));
    }));

    it('in deeply nested lazy engines that appear in host lazy engine', co.wrap(function* () {
      let app = new AddonTestApp();
      let appName = 'engine-testing';
      let engineName = 'lazy';
      let nestedEngineName = 'lazy-in-lazy';
      let addonName = 'nested';

      yield app.create(appName, { noFixtures: true });
      let engine = yield InRepoEngine.generate(app, engineName, { lazy: true });
      let addon = yield engine.generateNestedAddon(addonName);
      let nestedEngine = yield engine.generateNestedEngine(nestedEngineName, { lazy: true });

      nestedEngine.nest(addon);

      addon.writeFixture({
        app: {
          'foo.js': `export { default } from 'nested/components/foo';`
        },
        addon: {
          styles: {
            'addon.css': `/* ${addonName}.css */`
          },
          components: {
            'foo.js': `export default {}`
          },
          templates: {
            components: {
              'foo.hbs': `<h1>foo</h1>`
            }
          }
        },
        public: {
          'some-file.txt': `some file`
        }
      });

      let output = yield build(app);

      // Verify all the files are NOT in the host application's assets
      output.doesNotContain(`assets/${appName}.js`, moduleMatcher(`${appName}/foo`));
      output.doesNotContain('nested/some-file.txt');
      output.doesNotContain('assets/vendor.js', moduleMatcher(`${addonName}/components/foo`));
      output.doesNotContain('assets/vendor.js', moduleMatcher(`${addonName}/templates/components/foo`));
      output.doesNotContain('assets/vendor.css', cssCommentMatcher(`${addonName}.css`));

      // Verify all the files are in the host engine's assets
      output.contains(`engines-dist/${engineName}/assets/engine.js`, reexportMatcher(`${addonName}/components/foo`, `${engineName}/foo`));

      output.contains(`engines-dist/${engineName}/nested/some-file.txt`);
      output.contains(`engines-dist/${engineName}/assets/engine-vendor.js`, moduleMatcher(`${addonName}/components/foo`));
      output.contains(`engines-dist/${engineName}/assets/engine-vendor.js`, moduleMatcher(`${addonName}/templates/components/foo`));
      output.contains(`engines-dist/${engineName}/assets/engine-vendor.css`, cssCommentMatcher(`${addonName}.css`));


      // All other files should not be included
      output.contains(`engines-dist/${nestedEngineName}/assets/engine.js`, reexportMatcher(`${addonName}/components/foo`, `${nestedEngineName}/foo`));

      output.doesNotContain(`engines-dist/${nestedEngineName}/nested/some-file.txt`);
      output.doesNotContain(`engines-dist/${nestedEngineName}/assets/engine-vendor.js`, moduleMatcher(`${addonName}/components/foo`));
      output.doesNotContain(`engines-dist/${nestedEngineName}/assets/engine-vendor.js`, moduleMatcher(`${addonName}/templates/components/foo`));
      output.doesNotContain(`engines-dist/${nestedEngineName}/assets/engine-vendor.css`, cssCommentMatcher(`${addonName}.css`));
    }));
  });
});
