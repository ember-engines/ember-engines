import { module, test } from 'qunit';
import { click, currentURL, find, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | blog in isolation', function (hooks) {
  setupApplicationTest(hooks);

  test('it renders against the fake host', async function (assert) {
    await visit('/blog');
    assert.dom('[data-test-blog-user]').hasText('grace');
    assert.dom('[data-test-blog-greeting]').hasText('Hello from ui-kit');
    assert.strictEqual(getComputedStyle(find('[data-test-blog]')).paddingTop, '8px', 'Sass from source');
  });

  test('external routes resolve to the fake host', async function (assert) {
    await visit('/blog');
    await click('[data-test-blog-home]');
    assert.strictEqual(currentURL(), '/');
    assert.dom('[data-test-demo-home]').exists();
  });

  test('its own routes and its nested engine work', async function (assert) {
    await visit('/blog');
    await click('[data-test-post-link]');
    assert.strictEqual(currentURL(), '/blog/post/1');
    await visit('/blog/comments');
    assert.dom('[data-test-comments-user]').hasText('grace');
  });
});
