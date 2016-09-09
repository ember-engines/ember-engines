import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from '../helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | Bugs');

test('should be possible to build and boot an application instance', function (assert) {
  const application = this.application;
  const instance = application.buildInstance();

  // append new div to be the root element for this instance
  Ember.$('#ember-testing').parent().append('<div id="test-app-instance"></div>');

  let success;
  Ember.run(() => {
    // boot the instance and wait for it to finish
    instance.boot({
      rootElement: '#test-app-instance'
    }).then(() => success = true, () => success = false);
  });

  assert.ok(success, 'Expected instance to boot without problems');
});
