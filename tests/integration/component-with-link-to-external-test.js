import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('component-with-link-to-external', 'Integration | Component | component-with-link-to-external', {
  integration: true,

  beforeEach() {
    let testComponent = Ember.Component.extend();
    this.registry.register('component:test-component', testComponent);
  }
});

test('component renders with link-to-external', function(assert) {
  assert.expect(1);

  this.render(hbs`
    {{#test-component}}
      {{#link-to "view"}}Link To{{/link-to}}
      {{#link-to-external "view"}}Link To External{{/link-to-external}}
    {{/test-component}}
  `);

  assert.equal(this.$().length, 1);
});
