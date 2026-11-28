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

  test('before the first transition, a link whose route needs params has no URL', async function (assert) {
    await render(<template><LinkToExternal @route="item" data-test-item>Item</LinkToExternal></template>, {
      owner: this.engine,
    });

    assert.dom('[data-test-item]').doesNotHaveAttribute('href');
  });

  test('loadEngine builds a lazy engine from its bundle', async function (assert) {
    // An earlier test may have loaded comments already, so count the bundle's
    // loads rather than the engine's.
    let bundle = globalThis._embroiderEngineBundles_.find((b) => b.names.includes('comments'));
    let { load } = bundle;
    let loads = 0;
    bundle.load = () => {
      loads++;
      return load();
    };

    let comments;
    try {
      comments = await loadEngine('comments');
    } finally {
      bundle.load = load;
    }

    assert.strictEqual(loads, 1);
    assert.strictEqual(comments.mountPoint, 'comments');
    assert.strictEqual(comments.lookup('service:session'), this.owner.lookup('service:session'));
  });
});
