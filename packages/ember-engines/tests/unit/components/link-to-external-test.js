import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | pretty color', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    // setup an external route manually
    this.owner._externalRoutes['home'] = 'application';
  });

  test('it renders properly [curly braces]', async function(assert) {
    await render(hbs`{{link-to-external 'home' 'home'}}`);
    assert.equal(this.element.querySelector('a').textContent, 'home');
  });

  test('it renders properly [angle brackets]', async function(assert) {
    await render(hbs`<LinkToExternal @route='home'>home</LinkToExternal>`);
    assert.equal(this.element.querySelector('a').textContent, 'home');
  });
});
