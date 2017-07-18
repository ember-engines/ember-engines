import { moduleForComponent, test } from 'ember-qunit';
import wait from 'ember-test-helpers/wait';
import hbs from 'htmlbars-inline-precompile';
import engineResolverFor from 'ember-engines/test-support/engine-resolver-for';

const resolver = engineResolverFor('ember-blog');

moduleForComponent('hello-name', 'Integration | Component | hello name', {
  integration: true,
  resolver
});

test('it renders a component from a lazy engine', function(assert) {
  this.render(hbs`{{hello-name}}`);

  return wait().then(() => {
    assert.equal(this.$().text().trim(), 'Hello, Jerry!');
  });
});
