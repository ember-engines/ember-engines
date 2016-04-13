import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | routable engine demo');

test('can invoke components', function(assert) {
  visit('/routable-engine-demo/blog/new');

  andThen(() => {
    assert.equal(currentURL(), '/routable-engine-demo/blog/new');

    assert.equal(this.application.$('.routable-hello-world').text().trim(), 'Hello, world!');
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

test('internal links can be clicked', function(assert) {
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
