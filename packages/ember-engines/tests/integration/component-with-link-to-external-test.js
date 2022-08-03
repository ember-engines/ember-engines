import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { render } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";
import Component from "@ember/component";
import EmberRouter from '@ember/routing/router';

module("Integration | Component | component-with-link-to-external", function(
  hooks
) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    let testComponent = Component.extend();
    this.owner.register("component:test-component", testComponent);

    class Router extends EmberRouter {}
    Router.map(function() {
      this.route('view');
    });
    this.owner.register('router:main', Router);

    // setup an external route manually
    this.owner._externalRoutes['home'] = 'application';
  });

  test("component renders with link-to-external [angle brackets]", async function(assert) {
    assert.expect(1);

    await render(hbs`
      <TestComponent>
        <LinkTo @route="view">Link To</LinkTo>
        <LinkToExternal @route="home">Link To External</LinkToExternal>
      </TestComponent>
    `);

    assert.ok(this.element);
  });
});
