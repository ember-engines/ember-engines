import { module, test } from 'qunit';
import { click, currentURL, find, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

// Set when an engine's engine.js module is evaluated, which happens once per
// page. That's why this file runs in order and the laziness test comes first.
const loaded = (name) => (globalThis.__engineLoads ?? []).includes(name);

const hasCssRule = (needle) =>
  [...document.styleSheets].some((sheet) => {
    try {
      return [...sheet.cssRules].some((rule) => rule.cssText.includes(needle));
    } catch {
      return false;
    }
  });

module('Acceptance | engines', function (hooks) {
  setupApplicationTest(hooks);

  test('the blog engine and its CSS load on first visit, not at boot', async function (assert) {
    await visit('/');
    assert.dom('[data-test-home]').exists();
    assert.dom('[data-test-nav-post]').hasAttribute('href', '/blog/post/7', 'LinkTo into an inner engine route builds its URL before load');
    assert.false(loaded('blog'), 'blog JS not loaded at boot');
    assert.false(hasCssRule('data-test-blog'), 'blog CSS not loaded at boot');

    await visit('/blog');
    assert.true(loaded('blog'), 'blog JS loaded on visit');
    assert.true(hasCssRule('data-test-blog'), 'blog CSS loaded on visit');
    assert.false(loaded('comments'), 'the nested engine is not loaded with its parent');
  });

  test('a host LinkTo into an inner engine route with a model works', async function (assert) {
    await visit('/');
    await click('[data-test-nav-post]');
    assert.strictEqual(currentURL(), '/blog/post/7');
    assert.dom('[data-test-post-title]').hasText('Post 7');
  });

  test('the engine gets the host service and its compiled Sass', async function (assert) {
    await visit('/blog');
    assert.dom('[data-test-blog-user]').hasText('ada');
    let style = getComputedStyle(find('[data-test-blog]'));
    assert.strictEqual(style.outlineColor, 'rgb(102, 51, 153)', 'Sass variable from a partial');
    assert.strictEqual(style.paddingTop, '8px', 'Sass @each output');
  });

  test('an addon service looked up by name resolves in the host and in the engine', async function (assert) {
    await visit('/');
    assert.dom('[data-test-host-greeting]').hasText('Hello from ui-kit');
    let hostInstance = find('[data-test-host-greeting] [data-test-ui-greeting]').dataset.instance;

    await visit('/blog');
    assert.dom('[data-test-blog-greeting]').hasText('Hello from ui-kit');
    let engineInstance = find('[data-test-blog-greeting] [data-test-ui-greeting]').dataset.instance;
    assert.notStrictEqual(engineInstance, hostInstance, 'the engine has its own instance, as with app-js under compat');
  });

  test('LinkToExternal follows the host binding for this engine', async function (assert) {
    await visit('/blog');
    assert.dom('[data-test-blog-home]').hasAttribute('href', '/account');
    await click('[data-test-blog-home]');
    assert.strictEqual(currentURL(), '/account');
    assert.dom('[data-test-account]').exists();
  });

  test('LinkToExternal passes models and query params', async function (assert) {
    await visit('/blog');
    assert.dom('[data-test-blog-item]').hasAttribute('href', '/items/42?tab=details');
    await click('[data-test-blog-item]');
    assert.strictEqual(currentURL(), '/items/42?tab=details');
    assert.dom('[data-test-item]').hasText('42 details');
  });

  test('LinkToExternal reports the active state', async function (assert) {
    await visit('/blog');
    assert.dom('[data-test-blog-other]').doesNotHaveClass('active');
    await visit('/blog-two');
    assert.dom('[data-test-blog-other]').hasClass('active', 'bound to blog-two, and blog-two is current');
  });

  test('LinkToExternal takes @models, @current-when and @replace', async function (assert) {
    await visit('/blog-two');
    assert.dom('[data-test-blog-home-current-when]').hasClass('active', 'current-when names are external routes: other is bound to blog-two');

    await visit('/blog');
    assert.dom('[data-test-blog-home-current-when]').doesNotHaveClass('active', 'blog-two is not current on /blog');
    assert.dom('[data-test-blog-item-models]').hasAttribute('href', '/items/7');
    assert.dom('[data-test-blog-home]').doesNotHaveClass('active', 'without it, home (bound to account) is not active');

    // RouterService#replaceWith goes through transitionTo, so only count replaceWith.
    let router = this.owner.lookup('service:router');
    let replaced = 0;
    let { replaceWith } = router;
    router.replaceWith = (...args) => (replaced++, replaceWith.apply(router, args));
    try {
      await click('[data-test-blog-home-replace]');
      assert.strictEqual(replaced, 1, '@replace uses replaceWith');
      assert.strictEqual(currentURL(), '/account');

      await visit('/blog');
      await click('[data-test-blog-home]');
      assert.strictEqual(replaced, 1, 'without @replace it does not');
    } finally {
      router.replaceWith = replaceWith;
    }
  });

  test('LinkToExternal with a model that has not loaded has no URL and does nothing', async function (assert) {
    await visit('/blog');
    assert.dom('[data-test-blog-item-loading]').hasAttribute('href', '#');
    assert.dom('[data-test-blog-item-loading]').doesNotHaveClass('active');
    await click('[data-test-blog-item-loading]');
    assert.strictEqual(currentURL(), '/blog');
  });

  test('LinkToExternal leaves target=_blank links to the browser', async function (assert) {
    let defaultPrevented;
    // Runs after the link's handler; records it, then stops the real navigation.
    let record = (event) => {
      defaultPrevented = event.defaultPrevented;
      event.preventDefault();
    };
    document.addEventListener('click', record);
    try {
      await visit('/blog');
      await click('[data-test-blog-home-blank]');
      assert.false(defaultPrevented);
      assert.strictEqual(currentURL(), '/blog');
    } finally {
      document.removeEventListener('click', record);
    }
  });

  test('router-service transitionToExternal follows the binding', async function (assert) {
    await visit('/blog');
    await click('[data-test-go-home]');
    assert.strictEqual(currentURL(), '/account');
  });

  test('internal LinkTo and route model hooks work', async function (assert) {
    await visit('/blog');
    await click('[data-test-post-link]');
    assert.strictEqual(currentURL(), '/blog/post/1');
    assert.dom('[data-test-post-title]').hasText('Post 1');
  });

  test('query params in a lazy engine, including sticky ones', async function (assert) {
    await visit('/blog?sort=old');
    assert.dom('[data-test-sort]').hasText('old');
    await click('[data-test-post-link]');
    await click('[data-test-back]');
    assert.strictEqual(currentURL(), '/blog?sort=old', 'sticky QP restored');
    assert.dom('[data-test-sort]').hasText('old');
  });

  test('the same engine mounted twice keeps its own route names', async function (assert) {
    await visit('/blog-two');
    assert.dom('[data-test-blog]').exists();
    await click('[data-test-post-link]');
    assert.strictEqual(currentURL(), '/blog-two/post/1');
  });

  test('a nested engine loads on its own and gets its own bindings', async function (assert) {
    await visit('/blog');
    await click('[data-test-comments-link]');
    assert.true(loaded('comments'), 'comments loaded on visit');
    assert.strictEqual(currentURL(), '/blog/comments');
    assert.dom('[data-test-comments-user]').hasText('ada');
    assert.strictEqual(getComputedStyle(find('[data-test-comments]')).outlineColor, 'rgb(0, 128, 0)');
    assert.dom('[data-test-comments-home]').hasAttribute('href', '/', 'comments binds home to index, unlike blog');
    await click('[data-test-comments-home]');
    assert.strictEqual(currentURL(), '/');
  });
});
