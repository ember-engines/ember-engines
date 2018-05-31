import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | pretty color', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders properly', async function(assert) {
    await this.render(hbs`{{link-to-external 'home' 'home'}}`);
    assert.equal(this.element.querySelector('a').textContent, 'home');
  });
});
