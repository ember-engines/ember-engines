import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('link-to-external', 'Unit | Component | link-to-external', {
  unit: true
});

test('it renders properly', function(assert) {
  let component = this.subject({ params: [ 'index' ] });
  this.render();
  assert.ok(component.element, 'render an element');
});
