/* eslint-disable ember/no-classic-classes */
/* eslint-disable ember/no-classic-components */
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
    class TestComponent extends Component {}
    this.owner.register("component:test-component", TestComponent);

    class Router extends EmberRouter {}
    Router.map(function() {
      this.route('view');
    });
    this.owner.register('router:main', Router);

    // setup an external route manually
    this.owner._externalRoutes['home'] = 'application';
  });

  test("component renders with link-to-external [curly braces]", async function(assert) {
    assert.expect(1);

    await render(hbs`
    {{#test-component}}
      {{#link-to route="view"}}Link To{{/link-to}}
      {{#link-to-external "home"}}Link To External{{/link-to-external}}
    {{/test-component}}
  `);

    assert.ok(this.element);
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
