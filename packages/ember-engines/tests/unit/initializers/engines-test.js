import Application from '@ember/application';
import { run } from '@ember/runloop';
import EnginesInitializer from '../../../initializers/engines';
import { module, test } from 'qunit';
import Resolver from '../../../resolver';
import config from '../../../config/environment';

class App extends Application {
  Resolver = Resolver;
  modulePrefix = config.modulePrefix;
}
let application;

module('Unit | Initializer | engines', function (hooks) {
  hooks.beforeEach(function () {
    run(() => {
      application = App.create();
    });
  });

  // Replace this with your real tests.
  test('it works', function (assert) {
    EnginesInitializer.initialize(application);

    // you would normally confirm the results of the initializer here
    assert.ok(true);
  });
});
