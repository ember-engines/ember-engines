import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | routeless engine demo');

test('can invoke components directly in an engine and also that are dependencies of an engine', function(
  assert
) {
  visit('/routeless-engine-demo');

  andThen(() => {
    assert.equal(currentURL(), '/routeless-engine-demo');

    assert.equal(
      this.application
        .$('.hello .greeting')
        .text()
        .trim(),
      'Hello'
    );
    assert.equal(
      this.application
        .$('.hola .greeting')
        .text()
        .trim(),
      'Hola'
    );
  });
});

test('can rerender a component in a routeless engine', function(assert) {
  visit('/routeless-engine-demo');

  andThen(() => {
    let $clickCount = find('.click-count');
    assert.equal($clickCount.text().trim(), '0');
    click('button.clicker');
    andThen(() => {
      assert.equal($clickCount.text().trim(), '1');
    });
  });
});
