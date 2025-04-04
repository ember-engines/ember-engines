/* eslint-disable ember/no-classic-classes */
/* eslint-disable ember/no-actions-hash */
/* global define, self */
/*eslint no-redeclare: 0*/

import {
  macroCondition,
  importSync,
  dependencySatisfies,
} from '@embroider/macros';

import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupOnerror, click, currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import App from 'dummy/app';

let preloadAssets = null;
let manifest = null;
if (macroCondition(!dependencySatisfies('@embroider/core', '*'))) {
  preloadAssets = importSync(
    'ember-asset-loader/test-support/preload-assets',
  ).default;
  // this gets removed from the build by an embroider compat adapter
  // we must not request it in an embroider build or it would break the build
  manifest = importSync('dummy/config/asset-manifest').default;
}

const SEPARATORS = /\/|\\/;

module('Acceptance | lazy routable engine', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    if (macroCondition(!dependencySatisfies('@embroider/core', '*'))) {
      await preloadAssets(manifest);
    }

    // Remove the ember-blog to fake it having "not loaded".
    this._engineModule = self.requirejs.entries['ember-blog/engine'];
    delete self.requirejs.entries['ember-blog/engine'];

    // We stub out the loader methods so that we can verify what they're doing.
    const module = this;
    this.loader = this.owner.lookup('service:asset-loader');
    this.loadEvents = [];

    this.loader.defineLoader('js', function (uri) {
      module.loadEvents.push(uri);

      // "Load" the engine module.
      if (uri.indexOf('engine.js') !== -1) {
        self.requirejs.entries['ember-blog/engine'] = module._engineModule;
      }

      return RSVP.resolve();
    });

    this.loader.defineLoader('css', function (uri) {
      module.loadEvents.push(uri);
      return RSVP.resolve();
    });
  });

  hooks.afterEach(function () {
    // Reset this initializer so subsequent tests don't blow up.
    delete App.instanceInitializers['stub-loader-methods'];

    self.requirejs.entries['ember-blog/engine'] = this._engineModule;
  });

  function verifyInitialBlogRoute(assert, loadEvents, element) {
    assert.equal(loadEvents.length, 3, 'loaded 3 assets');
    assert.deepEqual(
      loadEvents[0].split(SEPARATORS),
      ['', 'engines-dist', 'ember-blog', 'assets', 'engine-vendor.js'],
      'loaded engine vendor js',
    );
    assert.deepEqual(
      loadEvents[1].split(SEPARATORS),
      ['', 'engines-dist', 'ember-blog', 'assets', 'engine.css'],
      'loaded engine css',
    );
    assert.deepEqual(
      loadEvents[2].split(SEPARATORS),
      ['', 'engines-dist', 'ember-blog', 'assets', 'engine.js'],
      'loaded engine js',
    );

    assert.equal(currentURL(), '/routable-engine-demo/blog/new');

    assert.equal(
      element.querySelector('.routable-hello-world').textContent.trim(),
      'Hello, world!',
    );
    assert.equal(
      element.querySelector('.hello-name').textContent.trim(),
      'Hello, Jerry!',
      'Re-rendered hello-name component correctly',
    );
  }

  test('@classiconly it should pause to load JS and CSS assets on deep link into a lazy Engine', async function (assert) {
    assert.expect(7);

    await visit('/routable-engine-demo/blog/new');

    verifyInitialBlogRoute(assert, this.loadEvents, this.element);
  });

  test('@classiconly it should pause to load JS and CSS assets if previous deep link into a lazy Engine has failed', async function (assert) {
    assert.expect(9);

    const jsLoader = this.loader.__assetLoaders.js;
    const cssLoader = this.loader.__assetLoaders.css;

    // ensure that the global rejection handler isn't hit (RSVP promises that reject end up going through Ember.onerror)
    // this is reset automatically by @ember/test-helpers
    setupOnerror((error) => {
      assert.strictEqual(
        error.message,
        'The bundle "ember-blog" failed to load.',
      );
    });

    try {
      const failLoader = () => RSVP.reject('rejected');

      this.loader.defineLoader('js', failLoader);
      this.loader.defineLoader('css', failLoader);

      await assert.rejects(
        visit('/routable-engine-demo/blog/new'),
        'The bundle "ember-blog" failed to load.',
      );
    } finally {
      this.loader.defineLoader('js', jsLoader);
      this.loader.defineLoader('css', cssLoader);
    }

    await visit('/routable-engine-demo/blog/new');

    verifyInitialBlogRoute(assert, this.loadEvents, this.element);
  });

  test('@classiconly it should pause to load JS and CSS assets on an initial transition into a lazy Engine', async function (assert) {
    assert.expect(7);

    await visit('/routable-engine-demo');
    await click('.blog-new');

    verifyInitialBlogRoute(assert, this.loadEvents, this.element);
  });

  test('@classiconly it should pause to load JS and CSS assets if previous transition into a lazy Engine has failed', async function (assert) {
    assert.expect(9);

    let didError = false;
    define('dummy/routes/application', () =>
      Route.extend({
        actions: {
          error() {},
        },
      }),
    );

    setupOnerror((error) => {
      didError = true;
      // expect only BundleLoadErrors we expect
      if (
        error.toString() !==
        'BundleLoadError: The bundle "ember-blog" failed to load.'
      ) {
        // eslint-disable-next-line qunit/no-conditional-assertions
        assert.ok(false, 'unexpected bundle error');
      }
    });

    await visit('/routable-engine-demo');

    const jsLoader = this.loader.__assetLoaders.js;
    const cssLoader = this.loader.__assetLoaders.css;
    const failLoader = () => RSVP.reject('rejected');

    this.loader.defineLoader('js', failLoader);
    this.loader.defineLoader('css', failLoader);

    assert.notOk(didError, 'expected no global error yet');
    await click('.blog-new');
    assert.ok(didError, 'expected global error');

    this.loader.defineLoader('js', jsLoader);
    this.loader.defineLoader('css', cssLoader);

    await click('.blog-new');

    verifyInitialBlogRoute(assert, this.loadEvents, this.element);
  });

  test('@classiconly it should not pause to load assets on subsequent transitions into a lazy Engine', async function (assert) {
    assert.expect(10);

    await visit('/routable-engine-demo/blog/new');

    verifyInitialBlogRoute(assert, this.loadEvents, this.element);

    await click('.routeable-engine');

    assert.strictEqual(currentURL(), '/routable-engine-demo');

    await click('.blog-new');

    assert.strictEqual(
      this.loadEvents.length,
      3,
      'did not load additional assets',
    );
    assert.strictEqual(currentURL(), '/routable-engine-demo/blog/new');
  });

  test('@classiconly it should not pause to load assets on transition to a loaded, but not initialized instance of a lazy Engine (e.g., Engine mounted more than once)', async function (assert) {
    assert.expect(10);

    await visit('/routable-engine-demo/blog/new');

    verifyInitialBlogRoute(assert, this.loadEvents, this.element);

    await click('.routeable-engine');

    assert.strictEqual(currentURL(), '/routable-engine-demo');

    await click('.ember-blog-new');

    assert.strictEqual(
      this.loadEvents.length,
      3,
      'did not load additional assets',
    );
    assert.strictEqual(currentURL(), '/routable-engine-demo/ember-blog/new');
  });

  test('it should not pause to load assets on deep link into an eager Engine', async function (assert) {
    await visit('/routable-engine-demo/eager-blog');

    assert.strictEqual(this.loadEvents.length, 0, 'no load events occured');
    assert.strictEqual(currentURL(), '/routable-engine-demo/eager-blog');
  });

  test('it should not pause to load assets on transition into an eager Engine', async function (assert) {
    await visit('/routable-engine-demo');
    await click('.eager-blog');

    assert.strictEqual(this.loadEvents.length, 0, 'no load events occured');
    assert.strictEqual(currentURL(), '/routable-engine-demo/eager-blog');
  });

  test('@classiconly it should bubble the bundle error to the application', async function (assert) {
    assert.expect(7);

    const failLoader = () => RSVP.reject('rejected');

    this.loader.defineLoader('css', failLoader);

    let routeDidError = false;
    let routeError;
    //TODO refactor form actions
    this.owner.register(
      'route:application',
      Route.extend({
        actions: {
          error(error) {
            routeDidError = true;
            routeError = error;
          },
        },
      }),
    );

    // ensure that the global rejection handler isn't hit (RSVP promises that reject end up going through Ember.onerror)
    // this is reset automatically by @ember/test-helpers
    setupOnerror((error) => {
      assert.strictEqual(error.name, 'BundleLoadError');
      assert.strictEqual(
        error.message,
        'The bundle "ember-blog" failed to load.',
      );
      assert.strictEqual(error.errors.length, 1, 'expects only one error');
      let nestedError = error.errors[0];
      assert.strictEqual(nestedError.name, 'AssetLoadError');
      assert.strictEqual(
        nestedError.message,
        'The css asset with uri "/engines-dist/ember-blog/assets/engine.css" failed to load with the error: rejected.',
      );

      assert.ok(
        routeDidError,
        'expected dummy/routes/application actions.error to have been invoked',
      );
      assert.strictEqual(
        error,
        routeError,
        'expected dummy/routes/application actions.error to have the same argument as the visit rejects with',
      );
    });

    // does not reject because the setupOnerror above doesn't re-throw
    await visit('/routable-engine-demo/blog/new');
  });
});
