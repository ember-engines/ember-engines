import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit, click, find, currentURL } from '@ember/test-helpers';
import $ from 'jquery';

module('Acceptance | routeless engine demo', function (hooks) {
  setupApplicationTest(hooks);

  test('can invoke components directly in an engine and also that are dependencies of an engine', async function (
    assert
  ) {
    await visit('/routeless-engine-demo');

    assert.equal(currentURL(), '/routeless-engine-demo');

    assert.equal(
      $('.hello .greeting')
        .text()
        .trim(),
      'Hello'
    );
    assert.equal(
      $('.hola .greeting')
        .text()
        .trim(),
      'Hola'
    );
  });

  test('can rerender a component in a routeless engine', async function (assert) {
    await visit('/routeless-engine-demo');

    let $clickCount = find('.click-count');
    assert.equal($clickCount.textContent.trim(), '0');

    await click('button.clicker');

    assert.equal($clickCount.textContent.trim(), '1');
  });
});
