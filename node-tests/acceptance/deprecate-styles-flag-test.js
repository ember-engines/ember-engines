'use strict';

const AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;
const stripIndent = require('common-tags').stripIndent;

const build = require('../helpers/build');
const InRepoEngine = require('../helpers/in-repo-engine');
const matchers = require('../helpers/matchers');

const cssCommentMatcher = matchers.cssComment;

describe('Acceptance', function() {
  describe('useDeprecatedIncorrectCSSProcessing flag', function() {
    this.timeout(300000);

    it(
      'when enabled with lazy engines that have dependencies with app/styles',
      async function() {
        let app = new AddonTestApp();
        let appName = 'engine-testing';
        let engineName = 'lazy';
        let addonName = 'nested';

        await app.create(appName, { noFixtures: true });

        let engine = await InRepoEngine.generate(app, engineName, {
          lazy: true,
        });

        engine.writeFixture({
          'index.js': stripIndent`
          module.exports = {
            name: '${engineName}',
            lazyLoading: true,
            useDeprecatedIncorrectCSSProcessing: true
          };
        `,
        });

        let addon = await engine.generateNestedAddon(addonName);

        engine.nest(addon);

        addon.writeFixture({
          app: {
            styles: {
              [`${addonName}.css`]: `/* ${addonName}.css */`,
            },
          },
        });

        let output = await build(app);

        output.contains(
          `assets/${addonName}.css`,
          cssCommentMatcher(`${addonName}.css`)
        );
      });

    it(
      'when disabled with lazy engines that have dependencies with app/styles',
      async function() {
        let app = new AddonTestApp();
        let appName = 'engine-testing';
        let engineName = 'lazy';
        let addonName = 'nested';

        await app.create(appName, { noFixtures: true });
        let engine = await InRepoEngine.generate(app, engineName, {
          lazy: true,
        });
        let addon = await engine.generateNestedAddon(addonName);

        engine.nest(addon);

        addon.writeFixture({
          app: {
            styles: {
              [`${addonName}.css`]: `/* ${addonName}.css */`,
            },
          },
        });

        let output = await build(app);

        output.contains(
          `engines-dist/${engineName}/assets/engine.css`,
          cssCommentMatcher(`${addonName}.css`)
        );
      });
  });
});
