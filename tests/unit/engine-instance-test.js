import Ember from 'ember';
import EnginesInitializer from '../../initializers/engines';
import Engine from 'ember-engines/engine';
import emberRequire from 'ember-engines/-private/ext-require';
import { module, test } from 'qunit';

const getEngineParent = emberRequire('ember-application/system/engine-parent', 'getEngineParent');

const {
  Application,
  run
} = Ember;

let App, app, appInstance;

module('Unit | EngineInstance', {
  beforeEach() {
    EnginesInitializer.initialize();

    App = Application.extend({
      router: null
    });

    run(function() {
      app = App.create();
    });
  },

  afterEach() {
    if (appInstance) {
      run(appInstance, 'destroy');
    }

    if (app) {
      run(app, 'destroy');
    }
  }
});

test('it can build a child engine instance with no dependencies', function(assert) {
  assert.expect(2);

  let BlogEngine = Engine.extend({ router: null });

  app.register('engine:blog', BlogEngine);

  let appInstance = app.buildInstance();
  appInstance.setupRegistry();

  let blogEngineInstance = appInstance.buildChildEngineInstance('blog');

  assert.ok(blogEngineInstance);
  assert.strictEqual(getEngineParent(blogEngineInstance), appInstance, 'parent is assigned');

  return blogEngineInstance.boot();
});

test('it can build a child engine instance with dependencies', function(assert) {
  assert.expect(3);

  let storeService = {};
  app.register('service:store', storeService, { instantiate: false });

  let BlogEngine = Engine.extend({
    router: null,
    dependencies: {
      services: [
        'store'
      ]
    }
  });

  app.engines = {
    blog: {
      dependencies: {
        services: [
          'store'
        ]
      }
    }
  };

  app.register('engine:blog', BlogEngine);

  let appInstance = app.buildInstance();
  appInstance.setupRegistry();

  let blogEngineInstance = appInstance.buildChildEngineInstance('blog');

  assert.ok(blogEngineInstance);
  assert.strictEqual(getEngineParent(blogEngineInstance), appInstance, 'parent is assigned');

  return blogEngineInstance.boot().then(() => {
    assert.strictEqual(
      blogEngineInstance.lookup('service:store'),
      appInstance.lookup('service:store'),
      'services are identical'
    );
  });
});

test('it can build a child engine instance with dependencies that are aliased', function(assert) {
  assert.expect(3);

  let storeService = {};
  app.register('service:store', storeService, { instantiate: false });

  let BlogEngine = Engine.extend({
    router: null,
    dependencies: {
      services: [
        'data-store' // NOTE: Blog engine uses alias to 'store'
      ]
    }
  });

  app.engines = {
    blog: {
      dependencies: {
        services: [
          {'data-store': 'store'} // NOTE: Main engine provides alias
        ]
      }
    }
  };

  app.register('engine:blog', BlogEngine);

  let appInstance = app.buildInstance();
  appInstance.setupRegistry();

  let blogEngineInstance = appInstance.buildChildEngineInstance('blog');

  assert.ok(blogEngineInstance);
  assert.strictEqual(getEngineParent(blogEngineInstance), appInstance, 'parent is assigned');

  return blogEngineInstance.boot().then(() => {
    assert.strictEqual(
      blogEngineInstance.lookup('service:data-store'),
      appInstance.lookup('service:store'),
      'aliased services are identical'
    );
  });
});
