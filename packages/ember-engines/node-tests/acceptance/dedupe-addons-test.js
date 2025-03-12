'use strict';

const { join } = require('path');
const { Project } = require('fixturify-project');

const build = require('../helpers/build');
const InRepoAddon = require('../helpers/in-repo-addon');
const InRepoEngine = require('../helpers/in-repo-engine');
const matchers = require('../helpers/matchers');

const moduleMatcher = matchers.module;
const reexportMatcher = matchers.reexport;
const cssCommentMatcher = matchers.cssComment;

describe('Acceptance', function () {
  describe('dedupe addons', function () {
    this.timeout(300000);

    let project;
    let app; // this is actually going to be set to the baseDir of the project

    beforeEach(async () => {
      project = Project.fromDir(join(__dirname, '../fixtures/app-template'), {
        linkDevDeps: true,
      });
      project.linkDevDependency('ember-engines', {
        baseDir: '.',
        resolveName: '.',
      });

      await project.write();
      app = project.baseDir;
    });

    it('in lazy engines that are direct dependencies of the engine', async function () {
      let engineName = 'lazy';
      let addonName = 'nested';

      let addon = await InRepoAddon.generate(app, addonName);
      let engine = await InRepoEngine.generate(app, engineName, {
        lazy: true,
      });

      engine.nest(addon);

      addon.writeFixture({
        app: {
          'foo.js': `export { default } from 'nested/components/foo';`,
        },
        addon: {
          styles: {
            'addon.css': `/* ${addonName}.css */`,
          },
          components: {
            'foo.js': `export default {}`,
          },
          templates: {
            components: {
              'foo.hbs': `<h1>foo</h1>`,
            },
          },
        },
        public: {
          'some-file.txt': `some file`,
        },
      });

      let output = await build(app);

      // Verify all the files are in the host's assets
      output.contains(
        `assets/app-template.js`,
        moduleMatcher(`app-template/foo`),
      );
      output.contains('nested/some-file.txt');
      output.contains(
        'assets/vendor.js',
        moduleMatcher(`${addonName}/components/foo`),
      );
      output.contains(
        'assets/vendor.js',
        moduleMatcher(`${addonName}/templates/components/foo`),
      );
      output.contains(
        'assets/vendor.css',
        cssCommentMatcher(`${addonName}.css`),
      );

      // App folder should still be merged into the Engine's namespace
      output.contains(
        `engines-dist/${engineName}/assets/engine.js`,
        reexportMatcher(`${addonName}/components/foo`, `${engineName}/foo`),
      );

      // All other files should not be included
      output.doesNotContain(`engines-dist/${engineName}/nested/some-file.txt`);
      output.doesNotContain(
        `engines-dist/${engineName}/assets/engine-vendor.js`,
        moduleMatcher(`${addonName}/components/foo`),
      );
      output.doesNotContain(
        `engines-dist/${engineName}/assets/engine-vendor.js`,
        moduleMatcher(`${addonName}/templates/components/foo`),
      );
      output.doesNotContain(
        `engines-dist/${engineName}/assets/engine-vendor.css`,
        cssCommentMatcher(`${addonName}.css`),
      );
    });

    it('in lazy engines that are nested dependencies of the engine', async function () {
      process.env.EMBER_ENGINES_ADDON_DEDUPE = 1;
      let appName = 'app-template';
      let engineName = 'lazy';
      let engineAddonName = 'addon-in-lazy';
      let addonName = 'nested';

      let addon = await InRepoAddon.generate(app, addonName);
      let engine = await InRepoEngine.generate(app, engineName, {
        lazy: true,
      });
      let engineAddon = await engine.generateNestedAddon(engineAddonName, {
        lazy: true,
      });

      engineAddon.nest(addon);

      addon.writeFixture({
        app: {
          'foo.js': `export { default } from 'nested/components/foo';`,
        },
        addon: {
          styles: {
            'addon.css': `/* ${addonName}.css */`,
          },
          components: {
            'foo.js': `export default {}`,
          },
          templates: {
            components: {
              'foo.hbs': `<h1>foo</h1>`,
            },
          },
        },
        public: {
          'some-file.txt': `some file`,
        },
      });

      let output = await build(app);

      // Verify all the files are in the host's assets
      output.contains(`assets/${appName}.js`, moduleMatcher(`${appName}/foo`));
      output.contains('nested/some-file.txt');
      output.contains(
        'assets/vendor.js',
        moduleMatcher(`${addonName}/components/foo`),
      );
      output.contains(
        'assets/vendor.js',
        moduleMatcher(`${addonName}/templates/components/foo`),
      );
      output.contains(
        'assets/vendor.css',
        cssCommentMatcher(`${addonName}.css`),
      );

      // App folder should still be merged into the Engine's namespace
      output.contains(
        `engines-dist/${engineName}/assets/engine.js`,
        reexportMatcher(`${addonName}/components/foo`, `${engineName}/foo`),
      );

      // All other files should not be included
      output.doesNotContain(`engines-dist/${engineName}/nested/some-file.txt`);
      output.doesNotContain(
        `engines-dist/${engineName}/assets/engine-vendor.js`,
        moduleMatcher(`${addonName}/components/foo`),
      );
      output.doesNotContain(
        `engines-dist/${engineName}/assets/engine-vendor.js`,
        moduleMatcher(`${addonName}/templates/components/foo`),
      );
      output.doesNotContain(
        `engines-dist/${engineName}/assets/engine-vendor.css`,
        cssCommentMatcher(`${addonName}.css`),
      );
      delete process.env.EMBER_ENGINES_ADDON_DEDUPE;
    });

    it('in deeply nested lazy engines that appear in host application', async function () {
      let appName = 'app-template';
      let engineName = 'lazy';
      let nestedEngineName = 'lazy-in-lazy';
      let addonName = 'nested';

      let addon = await InRepoAddon.generate(app, addonName);
      let engine = await InRepoEngine.generate(app, engineName, {
        lazy: true,
      });
      let nestedEngine = await engine.generateNestedEngine(nestedEngineName, {
        lazy: true,
      });

      nestedEngine.nest(addon);

      addon.writeFixture({
        app: {
          'foo.js': `export { default } from 'nested/components/foo';`,
        },
        addon: {
          styles: {
            'addon.css': `/* ${addonName}.css */`,
          },
          components: {
            'foo.js': `export default {}`,
          },
          templates: {
            components: {
              'foo.hbs': `<h1>foo</h1>`,
            },
          },
        },
        public: {
          'some-file.txt': `some file`,
        },
      });

      let output = await build(app);

      // Verify all the files are in the host's assets
      output.contains(`assets/${appName}.js`, moduleMatcher(`${appName}/foo`));
      output.contains('nested/some-file.txt');
      output.contains(
        'assets/vendor.js',
        moduleMatcher(`${addonName}/components/foo`),
      );
      output.contains(
        'assets/vendor.js',
        moduleMatcher(`${addonName}/templates/components/foo`),
      );
      output.contains(
        'assets/vendor.css',
        cssCommentMatcher(`${addonName}.css`),
      );

      // App folder should still be merged into the Engine's namespace
      output.doesNotContain(
        `engines-dist/${engineName}/assets/engine.js`,
        reexportMatcher(`${addonName}/components/foo`, `${engineName}/foo`),
      );
      output.contains(
        `engines-dist/${nestedEngineName}/assets/engine.js`,
        reexportMatcher(
          `${addonName}/components/foo`,
          `${nestedEngineName}/foo`,
        ),
      );

      // All other files should not be included
      output.doesNotContain(`engines-dist/${engineName}/nested/some-file.txt`);
      output.doesNotContain(
        `engines-dist/${engineName}/assets/engine-vendor.js`,
        moduleMatcher(`${addonName}/components/foo`),
      );
      output.doesNotContain(
        `engines-dist/${engineName}/assets/engine-vendor.js`,
        moduleMatcher(`${addonName}/templates/components/foo`),
      );
      output.doesNotContain(
        `engines-dist/${engineName}/assets/engine-vendor.css`,
        cssCommentMatcher(`${addonName}.css`),
      );

      output.doesNotContain(
        `engines-dist/${nestedEngineName}/nested/some-file.txt`,
      );
      output.doesNotContain(
        `engines-dist/${nestedEngineName}/assets/engine-vendor.js`,
        moduleMatcher(`${addonName}/components/foo`),
      );
      output.doesNotContain(
        `engines-dist/${nestedEngineName}/assets/engine-vendor.js`,
        moduleMatcher(`${addonName}/templates/components/foo`),
      );
      output.doesNotContain(
        `engines-dist/${nestedEngineName}/assets/engine-vendor.css`,
        cssCommentMatcher(`${addonName}.css`),
      );
    });

    it('in deeply nested lazy engines that appear in host lazy engine', async function () {
      let appName = 'app-template';
      let engineName = 'lazy';
      let nestedEngineName = 'lazy-in-lazy';
      let addonName = 'nested';

      let engine = await InRepoEngine.generate(app, engineName, {
        lazy: true,
      });
      let addon = await engine.generateNestedAddon(addonName);
      let nestedEngine = await engine.generateNestedEngine(nestedEngineName, {
        lazy: true,
      });

      nestedEngine.nest(addon);

      addon.writeFixture({
        app: {
          'foo.js': `export { default } from 'nested/components/foo';`,
        },
        addon: {
          styles: {
            'addon.css': `/* ${addonName}.css */`,
          },
          components: {
            'foo.js': `export default {}`,
          },
          templates: {
            components: {
              'foo.hbs': `<h1>foo</h1>`,
            },
          },
        },
        public: {
          'some-file.txt': `some file`,
        },
      });

      let output = await build(app);

      // Verify all the files are NOT in the host application's assets
      output.doesNotContain(
        `assets/${appName}.js`,
        moduleMatcher(`${appName}/foo`),
      );
      output.doesNotContain('nested/some-file.txt');
      output.doesNotContain(
        'assets/vendor.js',
        moduleMatcher(`${addonName}/components/foo`),
      );
      output.doesNotContain(
        'assets/vendor.js',
        moduleMatcher(`${addonName}/templates/components/foo`),
      );
      output.doesNotContain(
        'assets/vendor.css',
        cssCommentMatcher(`${addonName}.css`),
      );

      // Verify all the files are in the host engine's assets
      output.contains(
        `engines-dist/${engineName}/assets/engine.js`,
        reexportMatcher(`${addonName}/components/foo`, `${engineName}/foo`),
      );

      output.contains(`engines-dist/${engineName}/nested/some-file.txt`);
      output.contains(
        `engines-dist/${engineName}/assets/engine-vendor.js`,
        moduleMatcher(`${addonName}/components/foo`),
      );
      output.contains(
        `engines-dist/${engineName}/assets/engine-vendor.js`,
        moduleMatcher(`${addonName}/templates/components/foo`),
      );
      output.contains(
        `engines-dist/${engineName}/assets/engine-vendor.css`,
        cssCommentMatcher(`${addonName}.css`),
      );

      // All other files should not be included
      output.contains(
        `engines-dist/${nestedEngineName}/assets/engine.js`,
        reexportMatcher(
          `${addonName}/components/foo`,
          `${nestedEngineName}/foo`,
        ),
      );

      output.doesNotContain(
        `engines-dist/${nestedEngineName}/nested/some-file.txt`,
      );
      output.doesNotContain(
        `engines-dist/${nestedEngineName}/assets/engine-vendor.js`,
        moduleMatcher(`${addonName}/components/foo`),
      );
      output.doesNotContain(
        `engines-dist/${nestedEngineName}/assets/engine-vendor.js`,
        moduleMatcher(`${addonName}/templates/components/foo`),
      );
      output.doesNotContain(
        `engines-dist/${nestedEngineName}/assets/engine-vendor.css`,
        cssCommentMatcher(`${addonName}.css`),
      );
    });
  });
});
