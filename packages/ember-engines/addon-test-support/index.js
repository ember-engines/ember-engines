import { getContext } from '@ember/test-helpers';

/**
 * Used to set up engine test. Must be called after one of the
 * `ember-qunit` `setup*Test()` methods.
 *
 *   Responsible for:
 *     - create an engine object and set it on the provided context (e.g. `this.engine`)
 *
 * @method setupEngineTest
 * @param {NestedHooks} hooks
 * @param {String} engineName
 * @param {String} mountPoint
 * @public
 */

export async function setupEngineTest(hooks, engineName, mountPoint) {
  hooks.beforeEach(function() {
    let engineInstance;

    if (this.owner.hasRegistration(`engine:${engineName}`)) {
      // eager engines
      engineInstance = this.owner.buildChildEngineInstance(engineName, {
        routable: true,
        mountPoint,
      });
    } else {
      // lazy engines
      engineInstance = await loadEngine(mountPoint);
    }

    await engineInstance.boot();

    // setup `this.engine`
    this.engine = engineInstance;
  });
}

async function loadEngine(mountPoint) {
  let context = getContext();
  const { owner } = context;

  // Engine construction happens in/on the router of the application
  // Engines use the application registry as a fallback, which means
  // any mocked services, etc that are injected won't get picked up.
  const router = owner.lookup('router:main');

  // Idempotent router setup, would otherwise be triggered by calling `visit()`
  router.setupRouter();

  if (!(mountPoint in router._engineInfoByRoute)) {
    throw new Error(`No engine is mounted at ${mountPoint}`);
  }

  // Create the engine instance using the engineInfo loaded by calling `setupRouter`
  const instance = await router._loadEngineInstance(
    router._engineInfoByRoute[mountPoint],
  );

  return instance;
}
