import { module, test, skip } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { render } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";
import Component from "@ember/component";
import { gte } from "ember-compatibility-helpers";

module("Integration | Component | component-with-link-to-external", function(
  hooks
) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    let testComponent = Component.extend();
    this.owner.register("component:test-component", testComponent);

    // setup an external route manually
    this.owner._externalRoutes['home'] = 'application';
  });

  test("component renders with link-to-external [curly braces]", async function(assert) {
    assert.expect(1);

    await render(hbs`
    {{#test-component}}
      {{#link-to "view"}}Link To{{/link-to}}
      {{#link-to-external "home"}}Link To External{{/link-to-external}}
    {{/test-component}}
  `);

    assert.ok(this.element);
  });

  (gte("3.10.0-beta.1") ? test : skip)(
    "component renders with link-to-external [angle brackets]",
    async function(assert) {
      assert.expect(1);

      await render(hbs`
    <TestComponent>
      <LinkTo @route="view">Link To</LinkTo>
      <LinkToExternal @route="home">Link To External</LinkToExternal>
    </TestComponent>
  `);

      assert.ok(this.element);
    }
  );
});
