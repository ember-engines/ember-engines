import Ember from 'ember';
import EnginesInitializer from '../../initializers/engines';
import { getEngineParent } from 'ember-engines/engine-parent';
import { module, test } from 'qunit';

const {
  Engine,
  run
} = Ember;

let MainEngine, mainEngine, mainEngineInstance;

module('Unit | EngineInstance', {
  setup() {
    EnginesInitializer.initialize();

    MainEngine = Engine.extend({
      router: null
    });

    run(function() {
      mainEngine = MainEngine.create();
    });
  },

  teardown() {
    if (mainEngineInstance) {
      run(mainEngineInstance, 'destroy');
    }

    if (mainEngine) {
      run(mainEngine, 'destroy');
    }
  }
});

test('it works', function(assert) {
  assert.ok(true);
});

test('it can build a child engine instance with no dependencies', function(assert) {
  assert.expect(3);

  let BlogEngine = Engine.extend({ router: null });

  mainEngine.register('engine:blog', BlogEngine);

  let mainEngineInstance = mainEngine.buildInstance();

  let blogEngineInstance = mainEngineInstance.buildChildEngineInstance('blog');

  assert.ok(blogEngineInstance);
  assert.strictEqual(getEngineParent(blogEngineInstance), mainEngineInstance, 'parent is assigned');

  blogEngineInstance.cloneCoreDependencies = function() {
    assert.ok(true, 'cloneCoreDependencies called');
  };

  return blogEngineInstance.boot();
});

test('it can build a child engine instance with dependencies', function(assert) {
  assert.expect(4);

  let storeService = {};
  mainEngine.register('service:store', storeService, { instantiate: false });

  let BlogEngine = Engine.extend({
    router: null,
    dependencies: {
      services: [
        'store'
      ]
    }
  });

  mainEngine.engines = {
    blog: {
      dependencies: {
        services: [
          'store'
        ]
      }
    }
  };

  mainEngine.register('engine:blog', BlogEngine);

  let mainEngineInstance = mainEngine.buildInstance();

  let blogEngineInstance = mainEngineInstance.buildChildEngineInstance('blog');

  assert.ok(blogEngineInstance);
  assert.strictEqual(getEngineParent(blogEngineInstance), mainEngineInstance, 'parent is assigned');

  blogEngineInstance.cloneCoreDependencies = function() {
    assert.ok(true, 'cloneCoreDependencies called');
  };

  return blogEngineInstance.boot().then(() => {
    assert.strictEqual(
      blogEngineInstance.lookup('service:store'),
      mainEngineInstance.lookup('service:store'),
      'services are identical'
    );
  });
});

test('it can build a child engine instance with dependencies that are aliased', function(assert) {
  assert.expect(4);

  let storeService = {};
  mainEngine.register('service:store', storeService, { instantiate: false });

  let BlogEngine = Engine.extend({
    router: null,
    dependencies: {
      services: [
        'data-store' // NOTE: Blog engine uses alias to 'store'
      ]
    }
  });

  mainEngine.engines = {
    blog: {
      dependencies: {
        services: [
          {'data-store': 'store'} // NOTE: Main engine provides alias
        ]
      }
    }
  };

  mainEngine.register('engine:blog', BlogEngine);

  let mainEngineInstance = mainEngine.buildInstance();

  let blogEngineInstance = mainEngineInstance.buildChildEngineInstance('blog');

  assert.ok(blogEngineInstance);
  assert.strictEqual(getEngineParent(blogEngineInstance), mainEngineInstance, 'parent is assigned');

  blogEngineInstance.cloneCoreDependencies = function() {
    assert.ok(true, 'cloneCoreDependencies called');
  };

  return blogEngineInstance.boot().then(() => {
    assert.strictEqual(
      blogEngineInstance.lookup('service:data-store'),
      mainEngineInstance.lookup('service:store'),
      'aliased services are identical'
    );
  });
});
