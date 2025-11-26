import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupEngine } from 'ember-engines/test-support';

module(
  'Integration | Component | engine-resolver-for | hello-name',
  function (hooks) {
    setupRenderingTest(hooks);
    setupEngine(hooks, 'ember-blog');

    test('@classiconly component renders properly after lookup with engine-resolver-for', async function (assert) {
      await render(hbs`<HelloName></HelloName>`, { owner: this.engine });

      assert.dom().containsText('Hello, Jerry!');
    });

    test('@classiconly it deprecates support for `engineResolveFor()`', async function (assert) {
      const engineResolverFor = (
        await import('ember-engines/test-support/engine-resolver-for')
      ).default;
      setupRenderingTest(hooks, { resolver: engineResolverFor('eager-blog') });

      assert.deprecationsInclude(
        "Use of `engineResolverFor` has been deprecated. Instead use `setupEngine(hooks, 'engine-name')` imported from `ember-engines/test-support` to load the engine you need.",
      );
    });
  },
);
