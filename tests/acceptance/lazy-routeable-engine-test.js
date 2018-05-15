/* global define, self */
import Route from '@ember/routing/route';

import RSVP from 'rsvp';
import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import App from '../../app';

const SEPARATORS = /\/|\\/;

moduleForAcceptance('Acceptance | lazy routable engine', {
  beforeEach() {
    // Remove the ember-blog to fake it having "not loaded".
    this._engineModule = self.requirejs.entries['ember-blog/engine'];
    delete self.requirejs.entries['ember-blog/engine'];

    // We stub out the loader methods so that we can verify what they're doing.
    const module = this;
    this.loader = this.application.__deprecatedInstance__.lookup(
      'service:asset-loader'
    );
    this.loadEvents = [];

    this.loader.defineLoader('js', function(uri) {
      module.loadEvents.push(uri);

      // "Load" the engine module.
      if (uri.indexOf('engine.js') !== -1) {
        self.requirejs.entries['ember-blog/engine'] = module._engineModule;
      }

      return RSVP.resolve();
    });

    this.loader.defineLoader('css', function(uri) {
      module.loadEvents.push(uri);
      return RSVP.resolve();
    });

    this._adapterException = Ember.Test.adapter.exception;
  },

  afterEach() {
    // Reset this initializer so subsequent tests don't blow up.
    delete App.instanceInitializers['stub-loader-methods'];

    self.requirejs.entries['ember-blog/engine'] = this._engineModule;
    Ember.Test.adapter.exception = this._adapterException;
  },
});

function verifyInitialBlogRoute(assert, loadEvents, application) {
  assert.equal(loadEvents.length, 3, 'loaded 3 assets');
  assert.deepEqual(
    loadEvents[0].split(SEPARATORS),
    ['', 'engines-dist', 'ember-blog', 'assets', 'engine-vendor.js'],
    'loaded engine vendor js'
  );
  assert.deepEqual(
    loadEvents[1].split(SEPARATORS),
    ['', 'engines-dist', 'ember-blog', 'assets', 'engine.css'],
    'loaded engine css'
  );
  assert.deepEqual(
    loadEvents[2].split(SEPARATORS),
    ['', 'engines-dist', 'ember-blog', 'assets', 'engine.js'],
    'loaded engine js'
  );

  assert.equal(currentURL(), '/routable-engine-demo/blog/new');

  assert.equal(
    application
      .$('.routable-hello-world')
      .text()
      .trim(),
    'Hello, world!'
  );
  assert.equal(
    application
      .$('.hello-name')
      .text()
      .trim(),
    'Hello, Jerry!',
    'Re-rendered hello-name component correctly'
  );
}

test('it should pause to load JS and CSS assets on deep link into a lazy Engine', async function(
  assert
) {
  assert.expect(7);

  await visit('/routable-engine-demo/blog/new');

  verifyInitialBlogRoute(assert, this.loadEvents, this.application)
});

test('it should pause to load JS and CSS assets if previous deep link into a lazy Engine has failed', async function(
  assert
) {
  assert.expect(7);

  define('dummy/routes/application', () =>
    Route.extend({
      actions: {
        error() {},
      },
    })
  );

  const jsLoader = this.loader.__assetLoaders.js;
  const cssLoader = this.loader.__assetLoaders.css;
  const failLoader = () => RSVP.reject('rejected');

  Ember.Test.adapter.exception = () => {};

  this.loader.defineLoader('js', failLoader);
  this.loader.defineLoader('css', failLoader);

  await visit('/routable-engine-demo/blog/new');

  this.loader.defineLoader('js', jsLoader);
  this.loader.defineLoader('css', cssLoader);

  await visit('/routable-engine-demo/blog/new');

  verifyInitialBlogRoute(assert, this.loadEvents, this.application);
  delete self.requirejs.entries['dummy/routes/application'];
});

test('it should pause to load JS and CSS assets on an initial transition into a lazy Engine', async function(
  assert
) {
  assert.expect(7);

  await visit('/routable-engine-demo');
  await click('.blog-new:last');

  verifyInitialBlogRoute(assert, this.loadEvents, this.application)
});

test('it should pause to load JS and CSS assets if previous transition into a lazy Engine has failed', async function(
  assert
) {
  assert.expect(7);

  define('dummy/routes/application', () =>
    Route.extend({
      actions: {
        error() {},
      },
    })
  );

  await visit('/routable-engine-demo');

  const jsLoader = this.loader.__assetLoaders.js;
  const cssLoader = this.loader.__assetLoaders.css;
  const failLoader = () => RSVP.reject('rejected');

  Ember.Test.adapter.exception = () => {};

  this.loader.defineLoader('js', failLoader);
  this.loader.defineLoader('css', failLoader);

  await click('.blog-new:last');

  this.loader.defineLoader('js', jsLoader);
  this.loader.defineLoader('css', cssLoader);

  await click('.blog-new:last');

  verifyInitialBlogRoute(assert, this.loadEvents, this.application);
  delete self.requirejs.entries['dummy/routes/application'];
});

test('it should not pause to load assets on subsequent transitions into a lazy Engine', async function(
  assert
) {
  assert.expect(10);

  await visit('/routable-engine-demo/blog/new');

  verifyInitialBlogRoute(assert, this.loadEvents, this.application)

  await click('.routeable-engine:last');

  assert.equal(currentURL(), '/routable-engine-demo');

  await click('.blog-new');

  assert.equal(this.loadEvents.length, 3, 'did not load additional assets');
  assert.equal(currentURL(), '/routable-engine-demo/blog/new');
});

test('it should not pause to load assets on transition to a loaded, but not initialized instance of a lazy Engine (e.g., Engine mounted more than once)', async function(
  assert
) {
  assert.expect(10);

  await visit('/routable-engine-demo/blog/new');

  verifyInitialBlogRoute(assert, this.loadEvents, this.application)

  await click('.routeable-engine:last');

  assert.equal(currentURL(), '/routable-engine-demo');

  await click('.ember-blog-new:last');

  assert.equal(this.loadEvents.length, 3, 'did not load additional assets');
  assert.equal(currentURL(), '/routable-engine-demo/ember-blog/new');
});

test('it should not pause to load assets on deep link into an eager Engine', async function(
  assert
) {
  assert.expect(2);

  await visit('/routable-engine-demo/eager-blog');

  assert.equal(this.loadEvents.length, 0, 'no load events occured');
  assert.equal(currentURL(), '/routable-engine-demo/eager-blog');
});

test('it should not pause to load assets on transition into an eager Engine', async function(
  assert
) {
  assert.expect(2);

  await visit('/routable-engine-demo');
  await click('.eager-blog:last');

  assert.equal(this.loadEvents.length, 0, 'no load events occured');
  assert.equal(currentURL(), '/routable-engine-demo/eager-blog');
});

test('it should bubble the bundle error to the application', async function(assert) {
  assert.expect(1);

  let done;
  let end = new Promise(resolve => done = resolve);
  const failLoader = () => RSVP.reject('rejected');

  Ember.Test.adapter.exception = () => {};

  this.loader.defineLoader('js', failLoader);
  this.loader.defineLoader('css', failLoader);

  define('dummy/routes/application', () =>
    Route.extend({
      actions: {
        error(error) {
          assert.ok(error, 'the bundle error is bubbled to the application');
          done();
        },
      },
    })
  );

  await visit('/routable-engine-demo/blog/new');

  delete self.requirejs.entries['dummy/routes/application'];

  await end;
});
