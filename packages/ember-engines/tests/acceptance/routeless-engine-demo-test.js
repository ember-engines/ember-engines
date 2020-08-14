import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { currentURL, visit, find, click } from '@ember/test-helpers';

module('Acceptance | routeless engine demo', function (hooks) {
  setupApplicationTest(hooks);

  test('can invoke components directly in an engine and also that are dependencies of an engine', async function (
    assert
  ) {
    await visit('/routeless-engine-demo');

    assert.equal(currentURL(), '/routeless-engine-demo');

    assert.equal(find('.hello .greeting').textContent.trim(), 'Hello');
    assert.equal(find('.hola .greeting').textContent.trim(), 'Hola');
  });

  test('can rerender a component in a routeless engine', async function (assert) {
    await visit('/routeless-engine-demo');

    let clickCount = find('.click-count');
    assert.equal(clickCount.textContent.trim(), '0');

    await click('button.clicker');

    assert.equal(clickCount.textContent.trim(), '1');
  });
});
