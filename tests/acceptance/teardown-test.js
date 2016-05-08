import { module, test } from 'qunit';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

module('Acceptance | teardown test');

test('routeable engines clean up their container state', function(assert) {
  let service;
  assert.expect(2);
  this.application = startApp();

  visit('/routable-engine-demo/blog/new');

  andThen(() => {
    assert.equal(currentURL(), '/routable-engine-demo/blog/new');
    service = this.application.__container__.lookup('service:store').__exampleServiceForTesting;
    destroyApp(this.application);
    assert.ok(service.isDestroyed, 'service got destroyed');
  });

});
