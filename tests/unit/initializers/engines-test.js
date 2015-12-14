import Ember from 'ember';
import EnginesInitializer from '../../../initializers/engines';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | engines', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  EnginesInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
