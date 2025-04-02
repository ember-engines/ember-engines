/* eslint-disable ember/no-private-routing-service */
import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupApplicationTest } from 'ember-qunit';
import { currentURL, visit, click } from '@ember/test-helpers';
import {
  macroCondition,
  importSync,
  dependencySatisfies,
} from '@embroider/macros';

module('Acceptance | routable engine demo', function (hooks) {
  setupApplicationTest(hooks);

  test('can invoke components', async function (assert) {
    await visit('/routable-engine-demo/blog/new');

    assert.strictEqual(currentURL(), '/routable-engine-demo/blog/new');

    assert.dom('.routable-hello-world').hasText('Hello, world!');
    assert
      .dom('.hello-name')
      .hasText('Hello, Jerry!', 'Re-rendered hello-name component correctly');
  });

  test("can deserialize a route's params", async function (assert) {
    await visit('/routable-engine-demo/blog/post/1');

    assert.strictEqual(currentURL(), '/routable-engine-demo/blog/post/1');

    assert.dom('h3.post-title').hasText('Post 1');
    assert.dom('p.author').hasText('Derek Zoolander');
  });

  test('can link-to application route of Engine', async function (assert) {
    await visit('/routable-engine-demo/blog/post/new');
    await click('.routable-post-blog-home-link-app');

    assert.strictEqual(currentURL(), '/routable-engine-demo/blog');
  });

  test('correctly handles navigation with query param in initial url', async function (assert) {
    await visit('/routable-engine-demo/blog/post/1?lang=English');

    assert.strictEqual(
      currentURL(),
      '/routable-engine-demo/blog/post/1?lang=English',
      'url is visited properly',
    );
    assert
      .dom('p.language')
      .hasText('English', 'query param value is passed through correctly - 1');

    await click('.routable-post-comments-link');

    assert.strictEqual(
      currentURL(),
      '/routable-engine-demo/blog/post/1/comments?lang=English',
      'query param is carried to sub-route',
    );
    assert
      .dom('p.language')
      .hasText('English', 'query param value is passed through correctly - 2');

    await click('.back-to-post-link');

    assert.strictEqual(
      currentURL(),
      '/routable-engine-demo/blog/post/1?lang=English',
      'query param is carried back to original route properly',
    );
    assert
      .dom('p.language')
      .hasText('English', 'query param value is passed through correctly - 3');

    await click('.routable-post-blog-home-link');
    assert.strictEqual(
      currentURL(),
      '/routable-engine-demo/blog',
      'query param is removed when changing route hierarchy',
    );

    await click('.routable-post-1-link');

    assert.strictEqual(
      currentURL(),
      '/routable-engine-demo/blog/post/1?lang=English',
      'query param is rehydrated in url',
    );
    assert
      .dom('p.language')
      .hasText('English', 'query param value is passed through correctly - 4');
  });

  test('can link-to a route with query params from outside an Engine', async function (assert) {
    await visit('/routable-engine-demo');
    await click('.blog-post-1-link-jp');

    assert.strictEqual(
      currentURL(),
      '/routable-engine-demo/blog/post/1?lang=Japanese',
    );
    assert.dom('p.language').hasText('Japanese');
  });

  test('can programmatically transition to a route with query params from outside an Engine', async function (assert) {
    await visit('/routable-engine-demo');
    await click('.blog-post-1-link-ch');

    assert.strictEqual(
      currentURL(),
      '/routable-engine-demo/blog/post/1?lang=Chinese',
    );
    assert.dom('p.language').hasText('Chinese');
  });

  test('can link-to a route with query params within an Engine', async function (assert) {
    await visit('/routable-engine-demo/blog');
    await click('.routable-post-1-link-jp');

    assert.strictEqual(
      currentURL(),
      '/routable-engine-demo/blog/post/1?lang=Japanese',
    );
    assert.dom('p.language').hasText('Japanese');
  });

  test('can programmatically transition to a route with query params within an Engine', async function (assert) {
    await visit('/routable-engine-demo/blog');
    await click('.routable-post-1-link-ch');

    assert.strictEqual(
      currentURL(),
      '/routable-engine-demo/blog/post/1?lang=Chinese',
    );
    assert.dom('p.language').hasText('Chinese');
  });

  test('can perform a QP-only link-to transition', async function (assert) {
    await visit('/routable-engine-demo/blog/post/1?lang=English');
    await click('.routable-post-jp-link');

    assert.strictEqual(
      currentURL(),
      '/routable-engine-demo/blog/post/1?lang=Japanese',
      'URL is updated properly',
    );
    assert.dom('p.language').hasText('Japanese', 'DOM is updated properly');
  });

  test('can perform a QP-only transitionTo', async function (assert) {
    await visit('/routable-engine-demo/blog/post/1?lang=English');
    await click('.routable-post-ch-link');

    assert.strictEqual(
      currentURL(),
      '/routable-engine-demo/blog/post/1?lang=Chinese',
      'URL is updated properly',
    );
    assert.dom('p.language').hasText('Chinese', 'DOM is updated properly');
  });

  test('can perform a redirect transition with QP', async function (assert) {
    await visit('/routable-engine-demo/redirect');
    assert.strictEqual(
      currentURL(),
      '/routable-engine-demo/blog/post/1?lang=English',
    );
  });

  test('can perform an afterModel transition with QP', async function (assert) {
    await visit('/routable-engine-demo/after-model/3');
    assert.strictEqual(
      currentURL(),
      '/routable-engine-demo/blog/post/3?lang=English',
    );
  });

  test('query param bucket cache does not collide when starting outside Engine', async function (assert) {
    await visit('/post/1?lang=English');
    await click('.blog-post-no-qp');

    assert.strictEqual(
      currentURL(),
      '/routable-engine-demo/blog/post/1',
      'URL does not have any query params',
    );

    await click('.non-blog-post');
    assert.strictEqual(
      currentURL(),
      '/post/1?lang=English',
      'URL has original query params',
    );
  });

  test('query param bucket cache does not collide when starting inside Engine', async function (assert) {
    await visit('/routable-engine-demo/blog/post/1?lang=English');
    await click('.non-blog-post');

    assert.strictEqual(
      currentURL(),
      '/post/1',
      'URL does not have any query params',
    );

    await click('.blog-post-no-qp');

    assert.strictEqual(
      currentURL(),
      '/routable-engine-demo/blog/post/1?lang=English',
      'URL has original query params',
    );
  });

  test("a route can lookup another route's model", async function (assert) {
    await visit('/routable-engine-demo/blog/post/1/comments');

    assert.strictEqual(
      currentURL(),
      '/routable-engine-demo/blog/post/1/comments',
    );

    assert.dom('h4.comments').hasText('Comments for Post 1');
  });

  test('can render a link', async function (assert) {
    await visit('/routable-engine-demo/blog/post/1');

    assert.strictEqual(currentURL(), '/routable-engine-demo/blog/post/1');

    assert
      .dom('a.routable-post-comments-link')
      .hasAttribute('href', '/routable-engine-demo/blog/post/1/comments');
  });

  test('link-to current-when attribute prepends engine mount point', async function (assert) {
    await visit('/routable-engine-demo/eager-blog/post/1');

    assert.strictEqual(currentURL(), '/routable-engine-demo/eager-blog/post/1');
    assert.dom('a.current-when-test-link').hasClass('active');
  });

  test('internal link to index can be clicked', async function (assert) {
    await visit('/routable-engine-demo/blog/post/1');
    await click('.routable-post-home-link');

    assert.strictEqual(currentURL(), '/');
  });

  test('external links can be clicked', async function (assert) {
    await visit('/routable-engine-demo/blog/post/1');
    await click('.routable-post-comments-link');

    assert.strictEqual(
      currentURL(),
      '/routable-engine-demo/blog/post/1/comments',
    );
  });

  test('a route can use transitionTo to transition to internal route', async function (assert) {
    await visit('/routable-engine-demo/blog/new');
    await click('.trigger-transition-to');

    assert.strictEqual(currentURL(), '/routable-engine-demo/blog/post/1');
  });

  test('internal links can be clicked', async function (assert) {
    await visit('/routable-engine-demo/special-admin-blog-here/post/1');
    await click('.routable-post-comments-link');

    assert.strictEqual(
      currentURL(),
      '/routable-engine-demo/special-admin-blog-here/post/1/comments',
    );
  });

  test('transitionTo works properly within parent application', async function (assert) {
    await visit('/routable-engine-demo/normal-route');

    assert.strictEqual(currentURL(), '/routeless-engine-demo');
  });

  test('transitionToExternal transitions to the parent application from within an engine and returns a thenable Transition object', async function (assert) {
    await visit('/routable-engine-demo/ember-blog/post/1');
    await click('.routable-post-transition-to-home-button');

    assert.strictEqual(currentURL(), '/');

    await click('.routeable-engine');
    await click('.ember-blog-new');
    await click('.trigger-transition-to');

    assert
      .dom('.routable-post-transition-to-home-button')
      .hasClass('transitioned-to-external');
  });

  test("transitionToExternalRoute transitions to the parent application from within an engine's controller and returns a thenable Transition object", async function (assert) {
    await visit('/routable-engine-demo/ember-blog/post/1');
    await click('.routable-post-transition-to-route-home-button');

    assert.strictEqual(currentURL(), '/');

    await click('.routeable-engine');
    await click('.ember-blog-new');
    await click('.trigger-transition-to');

    assert
      .dom('.routable-post-transition-to-route-home-button')
      .hasClass('transitioned-to-external-route');
  });

  test('replaceWithExternal transitions to the parent application from within an engine and returns a thenable Transition object', async function (assert) {
    await visit('/routable-engine-demo/ember-blog/post/1');
    await click('.routable-post-replace-with-home-button');

    assert.strictEqual(currentURL(), '/');

    await click('.routeable-engine');
    await click('.ember-blog-new');
    await click('.trigger-transition-to');

    assert
      .dom('.routable-post-replace-with-home-button')
      .hasClass('replaced-with-external');
  });

  test('loading routes and intermediateTransitionTo work within an engine', async function (assert) {
    assert.expect(2);

    this.owner.lookup('router:main').reopen({
      intermediateTransitionTo(routeName) {
        assert.strictEqual(routeName, 'blog.post.loading');
        this._super(...arguments);
      },
    });

    await visit('/routable-engine-demo/blog/post/1/comments');
    await click('.routable-post-likes-link');

    assert.strictEqual(currentURL(), '/routable-engine-demo/blog/post/1/likes');
  });

  test('error routes and intermediateTransitionTo work within an engine', async function (assert) {
    assert.expect(3);

    this.owner.lookup('router:main').reopen({
      intermediateTransitionTo(routeName) {
        assert.strictEqual(routeName, 'blog.post.error');
        this._super(...arguments);
      },
    });

    await visit('/routable-engine-demo/blog/post/1/comments');
    await click('.routable-post-diggs-link');

    assert.strictEqual(
      currentURL(),
      '/routable-engine-demo/blog/post/1/comments',
    );
    assert.dom('.error-message').hasText('Error: Nope!');
  });

  test('initializers run within engine', async function (assert) {
    if (macroCondition(!dependencySatisfies('@embroider/core', '*'))) {
      let assetLoader = this.owner.lookup('service:asset-loader');
      await assetLoader.loadBundle('ember-blog');
    }

    const Initializer = importSync(
      'ember-blog/initializers/ember-blog-initializer',
    );

    let stub = sinon.stub(Initializer.default, 'initialize');

    await visit('/routable-engine-demo/blog/new');

    assert.ok(stub.calledOnce, 'Initializer ran once');
  });

  test('instance initializers run within engine', async function (assert) {
    if (macroCondition(!dependencySatisfies('@embroider/core', '*'))) {
      let assetLoader = this.owner.lookup('service:asset-loader');
      await assetLoader.loadBundle('ember-blog');
    }

    const InstanceInitializer = importSync(
      'ember-blog/instance-initializers/ember-blog-instance-initializer',
    );

    let stub = sinon.stub(InstanceInitializer.default, 'initialize');

    await visit('/routable-engine-demo/blog/new');

    assert.ok(stub.calledOnce, 'Instance initializer ran once');
  });

  test('instance-initializers run after initializers', async function (assert) {
    assert.expect(2);

    let appInitialized = false;
    let instanceInitialized = false;

    if (macroCondition(!dependencySatisfies('@embroider/core', '*'))) {
      let assetLoader = this.owner.lookup('service:asset-loader');
      await assetLoader.loadBundle('ember-blog');
    }

    const Initializer = importSync(
      'ember-blog/initializers/ember-blog-initializer',
    );

    const InstanceInitializer = importSync(
      'ember-blog/instance-initializers/ember-blog-instance-initializer',
    );

    let appInit = sinon
      .stub(Initializer.default, 'initialize')
      .callsFake(() => {
        appInitialized = true;
        assert.notOk(
          instanceInitialized,
          'instance initialized has not run yet',
        );
      });

    let instanceInit = sinon
      .stub(InstanceInitializer.default, 'initialize')
      .callsFake(() => {
        instanceInitialized = true;
        assert.ok(appInitialized, 'initializer already ran');
      });

    await visit('/routable-engine-demo/blog/new');

    appInit.restore();
    instanceInit.restore();
  });
});
