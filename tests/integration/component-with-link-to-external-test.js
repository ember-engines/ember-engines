import Component from '@ember/component';
import { moduleForComponent, test, skip } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { gte } from 'ember-compatibility-helpers';

moduleForComponent(
  'component-with-link-to-external',
  'Integration | Component | component-with-link-to-external',
  {
    integration: true,

    beforeEach() {
      let testComponent = Component.extend();
      this.registry.register('component:test-component', testComponent);
    }
  }
);

test('component renders with link-to-external [curly braces]', function(assert) {
  assert.expect(1);

  this.render(hbs`
    {{#test-component}}
      {{#link-to "view"}}Link To{{/link-to}}
      {{#link-to-external "view"}}Link To External{{/link-to-external}}
    {{/test-component}}
  `);

  assert.equal(this.$().length, 1);
});

(gte('3.10.0-beta.1') ? test : skip)(
  'component renders with link-to-external [angle brackets]',
  function(assert) {
    assert.expect(1);

    this.render(hbs`
    <TestComponent>
      <LinkTo @route="view">Link To</LinkTo>
      <LinkToExternal @route="view">Link To External</LinkToExternal>
    </TestComponent>
  `);

    assert.equal(this.$().length, 1);
  }
);
