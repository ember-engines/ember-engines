import { module, test } from 'qunit';
import {
  render,
  click,
  visit,
  currentURL,
  teardownContext,
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import {
  setupTest,
  setupRenderingTest,
  setupApplicationTest,
} from 'ember-qunit';
import { setupEngine } from 'ember-engines/test-support';
import { isDestroyed } from '@ember/destroyable';

module('Integration | setupEngine', function () {
  module('setupEngineTest', function (hooks) {
    setupTest(hooks);
    setupEngine(hooks, 'ember-blog');

    test('it exists', function (assert) {
      let route = this.engine.lookup('route:post.likes');
      assert.ok(route);
    });

    test('it is destroyed with the test context', async function (assert) {
      assert.notOk(isDestroyed(this.engine));
      await teardownContext(this);
      assert.ok(isDestroyed(this.engine));
    });
  });

  module('setupEngineRenderingTest', function (hooks) {
    setupRenderingTest(hooks);
    setupEngine(hooks, 'ember-blog');

    test('should change colors', async function (assert) {
      // set the outer context to red
      this.set('colorValue', 'red');

      await render(hbs`<PrettyColor @name={{this.colorValue}} />`, {
        owner: this.engine,
      });

      assert
        .dom('[data-test-pretty-color]')
        .includesText('Pretty Color: red', 'starts as red');

      this.set('colorValue', 'blue');

      assert
        .dom('[data-test-pretty-color]')
        .includesText('Pretty Color: blue', 'updates to blue');
    });

    test('should update title on button click', async function (assert) {
      await render(hbs`<MagicTitle />`, { owner: this.engine });

      assert
        .dom('h2')
        .includesText('Hello World', 'initial text is hello world');

      // Click on the button
      await click('[data-test-title-button]');

      assert
        .dom('h2')
        .includesText('This is Magic', 'title changes after click');
    });
  });

  module('basic full application test', function (hooks) {
    setupApplicationTest(hooks);
    // no setupEngine in application tests, because they should load the engine automatically

    test('the user can visit blog engine', async function (assert) {
      await visit('/routable-engine-demo/blog/new');

      assert.deepEqual(currentURL(), '/routable-engine-demo/blog/new');
    });
  });
});
