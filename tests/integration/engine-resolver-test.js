import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import engineResolverFor from 'ember-engines/test-support/engine-resolver-for';

moduleForComponent('hello-name', 'Integration | Component | engine-resolver-for', {
  integration: true,
  resolver: engineResolverFor('ember-blog')
});

test('component renders properly after lookup with engine-resolver-for', function(assert) {
  assert.expect(1);

  this.render(hbs`{{#hello-name name="Tom"}}{{/hello-name}}`);

  assert.equal(this.$().text().trim(), 'Hello, Tom!');
});
