import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import engineResolverFor from 'ember-engines/test-support/engine-resolver-for';

module(
  'Integration | Component | engine-resolver-for | hello-name',
  function (hooks) {
    setupRenderingTest(hooks, { resolver: engineResolverFor('ember-blog') });

    test('component renders properly after lookup with engine-resolver-for', async function (assert) {
      assert.expect(1);

      await render(hbs`<HelloName></HelloName>`);

      assert.equal(this.element.innerText.trim(), 'Hello, Jerry!');
    });

    test('it deprecates support for `engineResolveFor()`', async function (assert) {
      assert.expect(1);

      setupRenderingTest(hooks, { resolver: engineResolverFor('eager-blog') });

      assert.deprecationsInclude(
        "Use of `engineResolverFor` has been deprecated. Instead use `setupEngine(hooks, 'engine-name')` imported from `ember-engines/test-support` to load the engine you need.",
      );
    });
  },
);
