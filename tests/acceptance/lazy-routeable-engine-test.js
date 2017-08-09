import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import App from '../../app';

const { RSVP } = Ember;
const SEPARATORS = /\/|\\/;

moduleForAcceptance('Acceptance | lazy routable engine', {
  beforeEach() {
    // Remove the ember-blog to fake it having "not loaded".
    this._engineModule = window.requirejs.entries['ember-blog/engine'];
    delete window.requirejs.entries['ember-blog/engine'];

    // We stub out the loader methods so that we can verify what they're doing.
    const module = this;
    this.loadEvents = [];
    this.application.instanceInitializer({
      name: 'stub-loader-methods',
      initialize(instance) {
        var loader = instance.lookup('service:asset-loader');

        loader.defineLoader('js', function(uri) {
          module.loadEvents.push(uri);

          // "Load" the engine module.
          if (uri.indexOf('engine.js') !== -1) {
            window.requirejs.entries['ember-blog/engine'] = module._engineModule;
          }

          return RSVP.resolve();
        });

        loader.defineLoader('css', function(uri) {
          module.loadEvents.push(uri);
          return RSVP.resolve();
        });
      }
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

test('it should pause to load JS and CSS assets on an initial transition into a lazy Engine', function(assert) {
  assert.expect(7);

  visit('/routable-engine-demo');
  click('.blog-new:last');
  andThen(() => verifyInitialBlogRoute(assert, this.loadEvents, this.application));
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
