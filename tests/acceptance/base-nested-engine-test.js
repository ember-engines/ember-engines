import { module, test, only } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | base + nested engines', function(hooks) {
  setupApplicationTest(hooks);

  only('visiting /base-engine', async function(assert) {
    await visit('/base-engine');

    assert.equal(
      unescape(document.querySelector('meta[name="base-engine/config/environment"]').content),
      '{"modulePrefix":"base-engine","environment":"test"}'
    );

    assert.equal(
      unescape(document.querySelector('meta[name="nested-engine/config/environment"]').content),
      '{"modulePrefix":"nested-engine","environment":"test"}'
    );

    await visit('/base-engine/nested-engine');
    assert.equal(currentURL(), '/base-engine/nested-engine');
  });
});
