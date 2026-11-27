import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import { loadEngine, setupEngine } from 'ember-engines-runtime/test-support';
import LinkToExternal from 'ember-engines-runtime/components/link-to-external';
import SessionUser from '../../src/components/session-user.gjs';

module('Integration | setupEngine', function (hooks) {
  setupRenderingTest(hooks);
  setupEngine(hooks, 'blog');

  test('the engine is mounted at its name and shares the host services it asks for', function (assert) {
    assert.strictEqual(this.engine.mountPoint, 'blog');
    assert.strictEqual(this.engine.lookup('service:session'), this.owner.lookup('service:session'));
  });

  test('its components render with the engine as their owner', async function (assert) {
    await render(
      <template>
        <span data-test-user><SessionUser /></span>
        <LinkToExternal @route="home" data-test-home>Home</LinkToExternal>
      </template>,
      { owner: this.engine },
    );

    assert.dom('[data-test-user]').hasText('grace');
    assert.dom('[data-test-home]').hasAttribute('href', '/', 'external routes follow the host binding');
  });

  test('loadEngine builds a lazy engine, loading its bundle if it hasn’t been', async function (assert) {
    let comments = await loadEngine('comments');

    assert.true(globalThis.__engineLoads.includes('comments'));
    assert.strictEqual(comments.mountPoint, 'comments');
    assert.strictEqual(comments.lookup('service:session'), this.owner.lookup('service:session'));
  });
});
