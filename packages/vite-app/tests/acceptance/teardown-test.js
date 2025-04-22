import { module, test } from 'qunit';
import {
  currentURL,
  visit,
  setupContext,
  setupApplicationContext,
  teardownContext,
} from '@ember/test-helpers';

module('Acceptance | teardown test', function (hooks) {
  hooks.beforeEach(async function () {
    this.testContext = {};

    await setupContext(this.testContext);
    await setupApplicationContext(this.testContext);
  });

  test('routeable engines clean up their container state', async function (assert) {
    let service;

    await visit('/routable-engine-demo/blog/new');

    assert.strictEqual(currentURL(), '/routable-engine-demo/blog/new');
    service =
      this.testContext.owner.lookup('service:store').__exampleServiceForTesting;

    await teardownContext(this.testContext);

    assert.ok(service.isDestroyed, 'service got destroyed');
  });

  test('routeless engines clean up their container state', async function (assert) {
    let service;

    await visit('/routeless-engine-demo');

    assert.strictEqual(currentURL(), '/routeless-engine-demo');
    service =
      this.testContext.owner.lookup('service:store').__exampleServiceForTesting;

    await teardownContext(this.testContext);

    assert.ok(service.isDestroyed, 'service got destroyed');
  });
});
