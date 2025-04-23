import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { currentURL, visit, click } from '@ember/test-helpers';

module('Acceptance | routeless engine demo', function (hooks) {
  setupApplicationTest(hooks);

  test('can invoke components directly in an engine and also that are dependencies of an engine', async function (assert) {
    await visit('/routeless-engine-demo');

    assert.strictEqual(currentURL(), '/routeless-engine-demo');

    assert.dom('.hello .greeting').hasText('Hello');
    assert.dom('.hola .greeting').hasText('Hola');
  });

  test('can rerender a component in a routeless engine', async function (assert) {
    await visit('/routeless-engine-demo');

    assert.dom('.click-count').hasText('0');

    await click('button.clicker');

    assert.dom('.click-count').hasText('1');
  });
});
