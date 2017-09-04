/* global define, window */
import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import App from '../../app';

const { RSVP } = Ember;
const SEPARATORS = /\/|\\/;
const nope = () => {};

moduleForAcceptance('Acceptance | lazy routable engine', {
  beforeEach() {
    // Remove the ember-blog to fake it having "not loaded".
    this._engineModule = window.requirejs.entries['ember-blog/engine'];
    delete window.requirejs.entries['ember-blog/engine'];

    // We stub out the loader methods so that we can verify what they're doing.
    const module = this;
    this.loader = this.application.__container__.lookup('service:asset-loader');
    this.loadEvents = [];

    this.loader.defineLoader('js', function(uri) {
      module.loadEvents.push(uri);

      // "Load" the engine module.
      if (uri.indexOf('engine.js') !== -1) {
        window.requirejs.entries['ember-blog/engine'] = module._engineModule;
      }

      return RSVP.resolve();
    });

    this.loader.defineLoader('css', function(uri) {
      module.loadEvents.push(uri);
      return RSVP.resolve();
    });
  },

  afterEach() {
    // Reset this initializer so subsequent tests don't blow up.
    delete App.instanceInitializers['stub-loader-methods'];

    window.requirejs.entries['ember-blog/engine'] = this._engineModule;
  }
});

function verifyInitialBlogRoute(assert, loadEvents, application) {
  assert.equal(loadEvents.length, 3, 'loaded 3 assets');
  assert.deepEqual(loadEvents[0].split(SEPARATORS), [ '', 'engines-dist', 'ember-blog', 'assets', 'engine-vendor.js' ], 'loaded engine vendor js');
  assert.deepEqual(loadEvents[1].split(SEPARATORS), [ '', 'engines-dist', 'ember-blog', 'assets', 'engine.css' ], 'loaded engine css');
  assert.deepEqual(loadEvents[2].split(SEPARATORS), [ '', 'engines-dist', 'ember-blog', 'assets', 'engine.js' ], 'loaded engine js');

  assert.equal(currentURL(), '/routable-engine-demo/blog/new');

  assert.equal(application.$('.routable-hello-world').text().trim(), 'Hello, world!');
  assert.equal(application.$('.hello-name').text().trim(), 'Hello, Jerry!', 'Re-rendered hello-name component correctly');
}

test('it should pause to load JS and CSS assets on deep link into a lazy Engine', function(assert) {
  assert.expect(7);

  visit('/routable-engine-demo/blog/new');
  andThen(() => verifyInitialBlogRoute(assert, this.loadEvents, this.application));
});

test('it should pause to load JS and CSS assets on deep link into a lazy Engine after retrying the transition', function(assert) {
  assert.expect(7);

  define('dummy/routes/application', () => (Ember.Route.extend({
      actions: {
        error: nope
      }
    })
  ));

  const adapterException = Ember.Test.adapter.exception;
  const loader = this.application.__container__.lookup('service:asset-loader');
  const jsLoader = loader.__assetLoaders.js;
  const cssLoader = loader.__assetLoaders.css;
  const failLoader = () => RSVP.reject('rejected');

  Ember.Test.adapter.exception = nope;
  loader.defineLoader('js', failLoader);
  loader.defineLoader('css', failLoader);
  visit('/routable-engine-demo/blog/new');

  andThen(() => {
    loader.defineLoader('js', jsLoader);
    loader.defineLoader('css', cssLoader);
    visit('/routable-engine-demo/blog/new');

    andThen(() => {
      verifyInitialBlogRoute(assert, this.loadEvents, this.application);
      Ember.Test.adapter.exception = adapterException;
      delete window.requirejs.entries['dummy/routes/application'];
    });
  });
});

test('it should pause to load JS and CSS assets on an initial transition into a lazy Engine', function(assert) {
  assert.expect(7);

  visit('/routable-engine-demo');
  click('.blog-new:last');
  andThen(() => verifyInitialBlogRoute(assert, this.loadEvents, this.application));
});

test('it should pause to load JS and CSS assets on deep link into a lazy Engine after retrying the transition', function(assert) {
  assert.expect(7);

  define('dummy/routes/application', () => (Ember.Route.extend({
      actions: {
        error: nope
      }
    })
  ));

  const adapterException = Ember.Test.adapter.exception;
  const loader = this.application.__container__.lookup('service:asset-loader');
  const jsLoader = loader.__assetLoaders.js;
  const cssLoader = loader.__assetLoaders.css;
  const failLoader = () => RSVP.reject('rejected');

  Ember.Test.adapter.exception = nope;
  loader.defineLoader('js', failLoader);
  loader.defineLoader('css', failLoader);
  visit('/routable-engine-demo');

  andThen(() => {
    loader.defineLoader('js', jsLoader);
    loader.defineLoader('css', cssLoader);
    click('.blog-new:last');

    andThen(() => {
      verifyInitialBlogRoute(assert, this.loadEvents, this.application);
      Ember.Test.adapter.exception = adapterException;
      delete window.requirejs.entries['dummy/routes/application'];
    });
  });
});

test('it should not pause to load assets on subsequent transitions into a lazy Engine', function(assert) {
  assert.expect(10);

  visit('/routable-engine-demo/blog/new');
  andThen(() => verifyInitialBlogRoute(assert, this.loadEvents, this.application));

  click('.routeable-engine:last');
  andThen(() => {
    assert.equal(currentURL(), '/routable-engine-demo');
  });

  click('.blog-new');
  andThen(() => {
    assert.equal(this.loadEvents.length, 3, 'did not load additional assets');
    assert.equal(currentURL(), '/routable-engine-demo/blog/new');
  });
});

test('it should not pause to load assets on transition to a loaded, but not initialized instance of a lazy Engine (e.g., Engine mounted more than once)', function(assert) {
  assert.expect(10);

  visit('/routable-engine-demo/blog/new');
  andThen(() => verifyInitialBlogRoute(assert, this.loadEvents, this.application));

  click('.routeable-engine:last');
  andThen(() => {
    assert.equal(currentURL(), '/routable-engine-demo');
  });

  click('.ember-blog-new:last');
  andThen(() => {
    assert.equal(this.loadEvents.length, 3, 'did not load additional assets');
    assert.equal(currentURL(), '/routable-engine-demo/ember-blog/new');
  });
});

test('it should not pause to load assets on deep link into an eager Engine', function(assert) {
  assert.expect(2);

  visit('/routable-engine-demo/eager-blog');
  andThen(() => {
    assert.equal(this.loadEvents.length, 0, 'no load events occured');
    assert.equal(currentURL(), '/routable-engine-demo/eager-blog');
  });
});

test('it should not pause to load assets on transition into an eager Engine', function(assert) {
  assert.expect(2);

  visit('/routable-engine-demo');
  click('.eager-blog:last');
  andThen(() => {
    assert.equal(this.loadEvents.length, 0, 'no load events occured');
    assert.equal(currentURL(), '/routable-engine-demo/eager-blog');
  });
});

test('it should bubble the bundle error to the application', function(assert) {
  assert.expect(1);

  const done = assert.async();
  const adapterException = Ember.Test.adapter.exception;
  const loader = this.application.__container__.lookup('service:asset-loader');
  const failLoader = () => RSVP.reject('rejected');

  Ember.Test.adapter.exception = nope;
  loader.defineLoader('js', failLoader);
  loader.defineLoader('css', failLoader);

  define('dummy/routes/application', () => (Ember.Route.extend({
      actions: {
        error(error) {
          assert.ok(error, 'the bundle error is bubbled to the application');
          done();
        }
      }
    })
  ));

  visit('/routable-engine-demo/blog/new');

  andThen(() => {
    Ember.Test.adapter.exception = adapterException;
    delete window.requirejs.entries['dummy/routes/application'];
  });
});
