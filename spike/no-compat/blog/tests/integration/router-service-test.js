import { module, test } from 'qunit';
import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import Engine from 'ember-engines-runtime/engine';
import { loadEngine, setupEngine } from 'ember-engines-runtime/test-support';
import EngineRouterService from 'ember-engines-runtime/services/router';

module('Integration | engine router service', function (hooks) {
  setupTest(hooks);
  setupEngine(hooks, 'blog');

  hooks.beforeEach(function () {
    this.router = this.engine.lookup('service:router');
    this.host = this.owner.lookup('service:router');
  });

  test('the base class registers it on the engine', function (assert) {
    assert.true(this.router instanceof EngineRouterService);
    assert.strictEqual(this.router.externalRouter, this.host);
  });

  test('it names routes inside the engine and external routes through the binding', function (assert) {
    assert.strictEqual(this.router.urlFor('post', 1), '/blog/post/1');
    assert.strictEqual(this.router.urlForExternal('item', 42), '/items/42');
  });

  test('transitions name routes inside the engine and pass URLs and models-only calls through', function (assert) {
    let calls = [];
    this.host.transitionTo = (...args) => calls.push(['transitionTo', ...args]);
    this.host.replaceWith = (...args) => calls.push(['replaceWith', ...args]);
    this.host.isActive = (...args) => (calls.push(['isActive', ...args]), true);

    this.router.transitionTo('post', 1);
    this.router.transitionTo('application');
    this.router.transitionTo('/somewhere', 'ignored');
    this.router.replaceWith({ queryParams: { page: 2 } });
    this.router.transitionToExternal('item', 42);
    this.router.isActive('post');

    assert.deepEqual(calls, [
      ['transitionTo', 'blog.post', 1],
      ['transitionTo', 'blog'],
      ['transitionTo', '/somewhere'],
      ['replaceWith', { queryParams: { page: 2 } }],
      ['transitionTo', 'item', 42],
      ['isActive', 'blog.post'],
    ]);
  });

  test('currentRouteName is relative to the mount point, and null before the host transitions', function (assert) {
    assert.strictEqual(this.router.currentRouteName, null);

    Object.defineProperty(this.host, 'currentRouteName', { value: 'blog', configurable: true });
    assert.strictEqual(this.router.currentRouteName, 'application');

    Object.defineProperty(this.host, 'currentRouteName', { value: 'blog.post', configurable: true });
    assert.strictEqual(this.router.currentRouteName, 'post');
  });

  test('route events take every Evented form on the host', function (assert) {
    let target = {
      calls: 0,
      handle() {
        this.calls++;
      },
    };

    this.router.on('routeDidChange', target, 'handle');
    this.host.trigger('routeDidChange');
    this.router.off('routeDidChange', target, 'handle');
    this.host.trigger('routeDidChange');

    assert.strictEqual(target.calls, 1);
  });
});

module('Integration | engine router service | opting out', function (hooks) {
  setupTest(hooks);

  class OwnRouter extends Service {}

  hooks.beforeEach(function () {
    this.owner.register(
      'engine:with-host-router',
      class extends Engine {
        engineName = 'with-host-router';
        dependencies = { services: ['router'] };
        modules = {};
      },
    );
    this.owner.register(
      'engine:with-own-router',
      class extends Engine {
        engineName = 'with-own-router';
        modules = { './services/router': { default: OwnRouter } };
      },
    );
    let { engines } = this.owner.base;
    engines['with-host-router'] = { dependencies: { services: ['router'] } };
    engines['with-own-router'] = { dependencies: {} };
  });

  hooks.afterEach(function () {
    delete this.owner.base.engines['with-host-router'];
    delete this.owner.base.engines['with-own-router'];
  });

  test("an engine that takes the host's router keeps it", async function (assert) {
    let engine = await loadEngine('with-host-router');
    assert.strictEqual(engine.lookup('service:router'), this.owner.lookup('service:router'));
  });

  test('an engine that ships a router service keeps it', async function (assert) {
    let engine = await loadEngine('with-own-router');
    assert.true(engine.lookup('service:router') instanceof OwnRouter);
  });
});
