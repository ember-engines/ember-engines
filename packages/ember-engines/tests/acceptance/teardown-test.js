import { module, test } from 'qunit';
import { currentURL, visit, setupContext, setupApplicationContext, teardownContext } from '@ember/test-helpers';

module('Acceptance | teardown test', function(hooks) {
  hooks.beforeEach(async function() {
    this.testContext = {};

    await setupContext(this.testContext);
    await setupApplicationContext(this.testContext);
  });

  test('routeable engines clean up their container state', async function(assert) {
    let service;
    assert.expect(2);

    await visit('/routable-engine-demo/blog/new');

    assert.equal(currentURL(), '/routable-engine-demo/blog/new');
    service = this.testContext.owner.lookup('service:store').__exampleServiceForTesting;

    await teardownContext(this.testContext);

    assert.ok(service.isDestroyed, 'service got destroyed');
  });

  test('routeless engines clean up their container state', async function(assert) {
    let service;
    assert.expect(2);

    await visit('/routeless-engine-demo');

    assert.equal(currentURL(), '/routeless-engine-demo');
    service = this.testContext.owner.lookup('service:store').__exampleServiceForTesting;

    await teardownContext(this.testContext);

    assert.ok(service.isDestroyed, 'service got destroyed');
  });
});
