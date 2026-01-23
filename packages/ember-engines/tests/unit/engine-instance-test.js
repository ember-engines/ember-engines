import Application from '@ember/application';
import EnginesInitializer from '../../initializers/engines';
import Engine from 'ember-engines/engine';
import { module, test } from 'qunit';

import Resolver from '../../resolver';
import config from '../../config/environment';

let App, app, appInstance;

module('Unit | EngineInstance', function (hooks) {
  hooks.beforeEach(function () {
    EnginesInitializer.initialize();

    App = class EmberApp extends Application {
      Resolver = Resolver;
      modulePrefix = config.modulePrefix;
      router = null;
      autoboot = false;
    };

    app = App.create();
  });

  hooks.afterEach(function () {
    if (appInstance) {
      appInstance.destroy();
    }
    app.destroy();
  });

  test('it can build a child engine instance without parent dependencies defined', function (assert) {
    class BlogEngine extends Engine {
      Resolver = Resolver;
      router = null;
      dependencies = Object.freeze({});
    }

    app.engines = undefined;

    app.register('engine:blog', BlogEngine);

    let appInstance = app.buildInstance();
    appInstance.setupRegistry();

    let blogEngineInstance = appInstance.buildChildEngineInstance('blog');

    assert.ok(blogEngineInstance);

    return blogEngineInstance.boot();
  });

  test('it can build a child engine instance with no dependencies', function (assert) {
    class BlogEngine extends Engine {
      Resolver = Resolver;
      router = null;
    }

    app.register('engine:blog', BlogEngine);

    let appInstance = app.buildInstance();
    appInstance.setupRegistry();

    let blogEngineInstance = appInstance.buildChildEngineInstance('blog');

    assert.ok(blogEngineInstance);

    return blogEngineInstance.boot();
  });

  test('it can build a child engine instance with dependencies', function (assert) {
    assert.expect(2);

    class BlogEngine extends Engine {
      Resolver = Resolver;
      router = null;
      dependencies = Object.freeze({
        services: ['store'],
      });
    }

    app.engines = {
      blog: {
        dependencies: {
          services: ['store'],
        },
      },
    };

    app.register('engine:blog', BlogEngine);

    let appInstance = app.buildInstance();
    appInstance.setupRegistry();

    let blogEngineInstance = appInstance.buildChildEngineInstance('blog');

    assert.ok(blogEngineInstance);

    return blogEngineInstance.boot().then(() => {
      assert.strictEqual(
        blogEngineInstance.lookup('service:store'),
        appInstance.lookup('service:store'),
        'services are identical',
      );
    });
  });

  test('it deprecates support for `router` service from host', function (assert) {
    class BlogEngine extends Engine {
      Resolver = Resolver;
      router = null;
      dependencies = Object.freeze({
        services: ['router'],
      });
    }

    app.engines = {
      blog: {
        dependencies: {
          services: ['router'],
        },
      },
    };

    app.register('engine:blog', BlogEngine);

    let appInstance = app.buildInstance();
    appInstance.setupRegistry();

    let blogEngineInstance = appInstance.buildChildEngineInstance('blog');

    assert.ok(blogEngineInstance);

    assert.deprecationsInclude(
      `Support for the host's router service has been deprecated. Please use a different name as 'hostRouter' or 'appRouter' instead of 'router'.`,
    );
  });

  test('it can build a child engine instance with dependencies that are aliased', function (assert) {
    assert.expect(2);

    class BlogEngine extends Engine {
      Resolver = Resolver;
      router = null;
      dependencies = Object.freeze({
        services: [
          'data-store', // NOTE: Blog engine uses alias to 'store'
        ],
      });
    }

    app.engines = {
      blog: {
        dependencies: {
          services: [
            { 'data-store': 'store' }, // NOTE: Main engine provides alias
          ],
        },
      },
    };

    app.register('engine:blog', BlogEngine);

    let appInstance = app.buildInstance();
    appInstance.setupRegistry();

    let blogEngineInstance = appInstance.buildChildEngineInstance('blog');

    assert.ok(blogEngineInstance);

    return blogEngineInstance.boot().then(() => {
      assert.strictEqual(
        blogEngineInstance.lookup('service:data-store'),
        appInstance.lookup('service:store'),
        'aliased services are identical',
      );
    });
  });
});
