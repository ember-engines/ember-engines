import Application from '@ember/application';
import { run } from '@ember/runloop';
import EnginesInitializer from '../../../initializers/engines';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | engines', function(hooks) {
  hooks.beforeEach(function() {
    run(() => {
      application = Application.create();
      application.deferReadiness();
    });
  });

  // Replace this with your real tests.
  test('it works', function(assert) {
    EnginesInitializer.initialize(application);

    // you would normally confirm the results of the initializer here
    assert.ok(true);
  });
});
