import { module, test } from 'qunit';
import { render, visit, currentURL } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupTest, setupRenderingTest, setupApplicationTest } from 'ember-qunit';
import { setupEngineTest } from 'ember-engines/test-support';

module('Integration | Starting Engines', function () {

  module('setupEngineTest', function (hooks) {
    setupTest(hooks);
    setupEngine(hooks, 'ember-blog');

    test('it exists', function (assert) {
      assert.expect(1);

      let route = this.engine.lookup('route:post.likes');
      assert.ok(route);
    });
  });

  module('setupEngineRenderingTest', function (hooks) {
    setupRenderingTest(hooks);
    setupEngine(hooks, 'ember-blog');

    test('should change colors', async function(assert) {
      assert.expect(2);

      // set the outer context to red
      this.set('colorValue', 'red');

      await render(hbs`{{pretty-color name=colorValue}}`, { owner: this.engine });

      assert.equal(this.element.querySelector('div').getAttribute('style'), 'color: red', 'starts as red');

      this.set('colorValue', 'blue');

      assert.equal(this.element.querySelector('div').getAttribute('style'), 'color: blue', 'updates to blue');
    });
  });

  module('basic full application test', function(hooks) {
    setupApplicationTest(hooks);
    // no setupEngine in application tests, because they should load the engine automatically

    test('the user can visit blog engine', async function(assert) {
      await visit('/routable-engine-demo/blog/new');

      assert.equal(currentURL(), '/routable-engine-demo/blog/new');
    });
  });

});
