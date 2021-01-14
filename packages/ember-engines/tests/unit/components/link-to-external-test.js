import { module, test, skip } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { gte } from 'ember-compatibility-helpers';

module('Integration | Component | pretty color', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    // setup an external route manually
    this.owner._externalRoutes['home'] = 'application';
  });

  test('it renders properly [curly braces]', async function(assert) {
    await this.render(hbs`{{link-to-external 'home' 'home'}}`);
    assert.equal(this.element.querySelector('a').textContent, 'home');
  });

  (gte('3.10.0-beta.1')
    ? test
    : skip)('it renders properly [angle brackets]', async function(assert) {
    await this.render(hbs`<LinkToExternal @route='home'>home</LinkToExternal>`);
    assert.equal(this.element.querySelector('a').textContent, 'home');
  });
});
