import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | routeable engine demo');

test('can invoke components', function(assert) {
  visit('/routeable-engine-demo/blog/new');

  andThen(() => {
    assert.equal(currentURL(), '/routeable-engine-demo/blog/new');

    assert.equal(this.application.$('.routeable-hello-world').text().trim(), 'Hello, world!');
  });
});

test('can render a link', function(assert) {
  visit('/routeable-engine-demo/blog/post/1');

  andThen(() => {
    assert.equal(currentURL(), '/routeable-engine-demo/blog/post/1');

    assert.equal(this.application.$('a.routeable-post-comments-link').attr('href'), '/routeable-engine-demo/blog/post/1/comments');
  });
});
