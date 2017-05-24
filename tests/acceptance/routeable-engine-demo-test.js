import Ember from 'ember';
import { test } from 'qunit';
import sinon from 'sinon';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import Initializer from 'ember-blog/initializers/ember-blog-initializer';
import InstanceInitializer from 'ember-blog/instance-initializers/ember-blog-instance-initializer';

moduleForAcceptance('Acceptance | routable engine demo');

test('can invoke components', function(assert) {
  visit('/routable-engine-demo/blog/new');

  andThen(() => {
    assert.equal(currentURL(), '/routable-engine-demo/blog/new');

    assert.equal(this.application.$('.routable-hello-world').text().trim(), 'Hello, world!');
    assert.equal(this.application.$('.hello-name').text().trim(), 'Hello, Jerry!', 'Re-rendered hello-name component correctly');
  });
});

test('can deserialize a route\'s params', function(assert) {
  assert.expect(3);

  visit('/routable-engine-demo/blog/post/1');

  andThen(() => {
    assert.equal(currentURL(), '/routable-engine-demo/blog/post/1');

    assert.equal(this.application.$('h3.post-title').text().trim(), 'Post 1');
    assert.equal(this.application.$('p.author').text().trim(), 'Derek Zoolander');
  });
});

test('can link-to application route of Engine', function(assert) {
  visit('/routable-engine-demo/blog/post/new');
  click('.routable-post-blog-home-link-app');
  andThen(() => {
    assert.equal(currentURL(), '/routable-engine-demo/blog');
    assert.equal(currentPath(), 'routable-engine-demo.blog.index');
  });
});

test('correctly handles navigation with query param in initial url', function(assert) {
  assert.expect(9);

  visit('/routable-engine-demo/blog/post/1?lang=English');
  andThen(() => {
    assert.equal(currentURL(), '/routable-engine-demo/blog/post/1?lang=English', 'url is visited properly');
    assert.equal(this.application.$('p.language').text().trim(), 'English', 'query param value is passed through correctly - 1');
  });

  click('.routable-post-comments-link');
  andThen(() => {
    assert.equal(currentURL(), '/routable-engine-demo/blog/post/1/comments?lang=English', 'query param is carried to sub-route');
    assert.equal(this.application.$('p.language').text().trim(), 'English', 'query param value is passed through correctly - 2');
  });


  click('.back-to-post-link');
  andThen(() => {
    assert.equal(currentURL(), '/routable-engine-demo/blog/post/1?lang=English', 'query param is carried back to original route properly');
    assert.equal(this.application.$('p.language').text().trim(), 'English', 'query param value is passed through correctly - 3');
  });

  click('.routable-post-blog-home-link');
  andThen(() => {
    assert.equal(currentURL(), '/routable-engine-demo/blog', 'query param is removed when changing route hierarchy');
  });

  click('.routable-post-1-link');
  andThen(() => {
    assert.equal(currentURL(), '/routable-engine-demo/blog/post/1?lang=English', 'query param is rehydrated in url');
    assert.equal(this.application.$('p.language').text().trim(), 'English', 'query param value is passed through correctly - 4');
  });
});

test('can link-to a route with query params from outside an Engine', function(assert) {
  assert.expect(2);

  visit('/routable-engine-demo');
  click('.blog-post-1-link-jp');
  andThen(() => {
    assert.equal(currentURL(), '/routable-engine-demo/blog/post/1?lang=Japanese');
    assert.equal(this.application.$('p.language').text().trim(), 'Japanese');
  });
});

test('can programmatically transition to a route with query params from outside an Engine', function(assert) {
  assert.expect(2);

  visit('/routable-engine-demo');
  click('.blog-post-1-link-ch');
  andThen(() => {
    assert.equal(currentURL(), '/routable-engine-demo/blog/post/1?lang=Chinese');
    assert.equal(this.application.$('p.language').text().trim(), 'Chinese');
  });
});

test('can link-to a route with query params within an Engine', function(assert) {
  assert.expect(2);

  visit('/routable-engine-demo/blog');
  click('.routable-post-1-link-jp');
  andThen(() => {
    assert.equal(currentURL(), '/routable-engine-demo/blog/post/1?lang=Japanese');
    assert.equal(this.application.$('p.language').text().trim(), 'Japanese');
  });
});

test('can programmatically transition to a route with query params within an Engine', function(assert) {
  assert.expect(2);

  visit('/routable-engine-demo/blog');
  click('.routable-post-1-link-ch');
  andThen(() => {
    assert.equal(currentURL(), '/routable-engine-demo/blog/post/1?lang=Chinese');
    assert.equal(this.application.$('p.language').text().trim(), 'Chinese');
  });
});

test('can perform a QP-only link-to transition', function(assert) {
  assert.expect(2);

  visit('/routable-engine-demo/blog/post/1?lang=English');
  click('.routable-post-jp-link');
  andThen(() => {
    assert.equal(currentURL(), '/routable-engine-demo/blog/post/1?lang=Japanese', 'URL is updated properly');
    assert.equal(this.application.$('p.language').text().trim(), 'Japanese', 'DOM is updated properly');
  });
});

test('can perform a QP-only transitionTo', function(assert) {
  assert.expect(2);

  visit('/routable-engine-demo/blog/post/1?lang=English');
  click('.routable-post-ch-link');
  andThen(() => {
    assert.equal(currentURL(), '/routable-engine-demo/blog/post/1?lang=Chinese', 'URL is updated properly');
    assert.equal(this.application.$('p.language').text().trim(), 'Chinese', 'DOM is updated properly');
  });
});

test('can perform a redirect transition with QP', function(assert) {
  assert.expect(1);

  visit('/routable-engine-demo/redirect');
  andThen(() => {
    assert.equal(currentURL(), '/routable-engine-demo/blog/post/1?lang=English');
  });
});

test('can perform an afterModel transition with QP', function(assert) {
  assert.expect(1);

  visit('/routable-engine-demo/after-model/3');
  andThen(() => {
    assert.equal(currentURL(), '/routable-engine-demo/blog/post/3?lang=English');
  });
});

test('query param bucket cache does not collide when starting outside Engine', function(assert) {
  assert.expect(2);

  visit('/post/1?lang=English');
  click('.blog-post-no-qp');
  andThen(() => {
    assert.equal(currentURL(), '/routable-engine-demo/blog/post/1','URL does not have any query params');
  });

  click('.non-blog-post');
  andThen(() => {
    assert.equal(currentURL(), '/post/1?lang=English', 'URL has original query params');
  });
});

test('query param bucket cache does not collide when starting inside Engine', function(assert) {
  assert.expect(2);

  visit('/routable-engine-demo/blog/post/1?lang=English');
  click('.non-blog-post');
  andThen(() => {
    assert.equal(currentURL(), '/post/1', 'URL does not have any query params');
  });

  click('.blog-post-no-qp');
  andThen(() => {
    assert.equal(currentURL(), '/routable-engine-demo/blog/post/1?lang=English', 'URL has original query params');
  });
});

test('a route can lookup another route\'s model', function(assert) {
  assert.expect(2);

  visit('/routable-engine-demo/blog/post/1/comments');

  andThen(() => {
    assert.equal(currentURL(), '/routable-engine-demo/blog/post/1/comments');

    assert.equal(this.application.$('h4.comments').text().trim(), 'Comments for Post 1');
  });
});

test('can render a link', function(assert) {
  assert.expect(2);

  visit('/routable-engine-demo/blog/post/1');

  andThen(() => {
    assert.equal(currentURL(), '/routable-engine-demo/blog/post/1');

    assert.equal(this.application.$('a.routable-post-comments-link').attr('href'), '/routable-engine-demo/blog/post/1/comments');
  });
});

test('link-to current-when attribute prepends engine mount point', function(assert) {
  assert.expect(2);

  visit('/routable-engine-demo/eager-blog/post/1');

  andThen(() => {
    assert.equal(currentURL(), '/routable-engine-demo/eager-blog/post/1');
    assert.ok(this.application.$('a.current-when-test-link').hasClass('active'));
  });
});

test('internal links can be clicked', function(assert) {
  assert.expect(1);

  visit('/routable-engine-demo/blog/post/1');
  click('.routable-post-home-link');

  andThen(() => {
    assert.equal(currentURL(), '/');
  });
});

test('external links can be clicked', function(assert) {
  assert.expect(1);

  visit('/routable-engine-demo/blog/post/1');
  click('.routable-post-comments-link');

  andThen(() => {
    assert.equal(currentURL(), '/routable-engine-demo/blog/post/1/comments');
  });
});

test('a route can use transitionTo to transition to internal route', function(assert) {
  assert.expect(1);

  visit('/routable-engine-demo/blog/new');
  click('.trigger-transition-to');

  andThen(() => {
    assert.equal(currentURL(), '/routable-engine-demo/blog/post/1');
  });
});

test('internal links can be clicked', function(assert) {
  assert.expect(1);

  visit('/routable-engine-demo/special-admin-blog-here/post/1');
  click('.routable-post-comments-link');

  andThen(() => {
    assert.equal(currentURL(), '/routable-engine-demo/special-admin-blog-here/post/1/comments');
  });
});

test('transitionTo works properly within parent application', function(assert) {
  assert.expect(1);

  visit('/routable-engine-demo/normal-route');

  andThen(() => {
    assert.equal(currentURL(), '/routeless-engine-demo');
  });
});

test('transitionToExternal transitions to the parent application from within an engine', function(assert) {
  assert.expect(2);

  visit('/routable-engine-demo/special-admin-blog-here/post/1');
  click('.routable-post-transition-to-home-button');

  andThen(() => {
    assert.equal(currentURL(), '/');

    visit('/routable-engine-demo/special-admin-blog-here/post/1');

    andThen(() => {
      assert.ok(this.application.$('.routable-post-transition-to-home-button').hasClass('transitioned-to-external'));
    })
  });
});

test('replaceWithExternal transitions to the parent application from within an engine', function(assert) {
  assert.expect(2);

  visit('/routable-engine-demo/special-admin-blog-here/post/1');
  click('.routable-post-replace-with-home-button');

  andThen(() => {
    assert.equal(currentURL(), '/');

    visit('/routable-engine-demo/special-admin-blog-here/post/1');

    andThen(() => {
      assert.ok(this.application.$('.routable-post-replace-with-home-button').hasClass('replaced-with-external'));
    })
  });
});

test('loading routes and intermediateTransitionTo work within an engine', function(assert) {
  assert.expect(2);

  this.application.__container__.lookup('router:main').reopen({
    intermediateTransitionTo(routeName) {
      assert.equal(routeName, 'blog.post.loading');
      this._super(...arguments);
    }
  });

  visit('/routable-engine-demo/blog/post/1/comments');
  click('.routable-post-likes-link');
  andThen(() => {
    assert.equal(currentURL(), '/routable-engine-demo/blog/post/1/likes');
  });
});

test('error routes and intermediateTransitionTo work within an engine', function(assert) {
  assert.expect(3);

  let originalExceptionHandler = Ember.Test.adapter.exception;
  Ember.Test.adapter.exception = () => {};

  this.application.__container__.lookup('router:main').reopen({
    intermediateTransitionTo(routeName) {
      assert.equal(routeName, 'blog.post.error');
      this._super(...arguments);
    }
  });

  visit('/routable-engine-demo/blog/post/1/comments');
  click('.routable-post-diggs-link');
  andThen(() => {
    assert.equal(currentURL(), '/routable-engine-demo/blog/post/1/comments');
    assert.equal(find('.error-message').text(), 'Error: Nope!');

    Ember.Test.adapter.exception = originalExceptionHandler;
  });
});

test('initializers run within engine', function(assert) {
  assert.expect(1);

  let stub = sinon.stub(Initializer, 'initialize');

  visit('/routable-engine-demo/blog/new');

  andThen(() => {
    assert.ok(stub.calledOnce, 'Initializer ran once');
    stub.restore();
  });
});

test('instance initializers run within engine', function(assert) {
  assert.expect(1);

  let stub = sinon.stub(InstanceInitializer, 'initialize');

  visit('/routable-engine-demo/blog/new');

  andThen(() => {
    assert.ok(stub.calledOnce, 'Instance initializer ran once');
    stub.restore();
  });
});

test('instance-initializers run after initializers', function(assert) {
  assert.expect(2);

  let appInitialized = false;
  let instanceInitialized = false;

  let appInit = sinon.stub(Initializer, 'initialize', function() {
    appInitialized = true;
    assert.ok(!instanceInitialized, 'instance initialized has not run yet');
  });
  let instanceInit = sinon.stub(InstanceInitializer, 'initialize', function() {
    instanceInitialized = true;
    assert.ok(appInitialized, 'initializer already ran');
  });

  visit('/routable-engine-demo/blog/new');

  andThen(() => {
    appInit.restore();
    instanceInit.restore();
  });
});
