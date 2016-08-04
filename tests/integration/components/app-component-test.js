import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('app-component', 'Integration | Component | app-component', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{#app-component}}{{/app-component}}`);
  assert.equal(this.$().text().trim(), 'I\'m a component!');
});
