import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | routeable engine demo');

test('can invoke components from a routeable engine', function(assert) {
  visit('/routeable-engine-demo/blog/new');

  andThen(() => {
    assert.equal(currentURL(), '/routeable-engine-demo/blog/new');

    assert.equal(this.application.$('.routeable-hello-world').text().trim(), 'Hello, world!');
  });
});
