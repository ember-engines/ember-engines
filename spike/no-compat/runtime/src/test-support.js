import { getContext } from '@ember/test-helpers';
import { associateDestroyableChild } from '@ember/destroyable';

/**
 * Boots the named engine before each test and sets it as `this.engine`. Look
 * the engine's routes, controllers and services up there, and render its
 * components with `render(template, { owner: this.engine })`. Call it after one
 * of ember-qunit's `setup*Test()` functions.
 *
 * The same API as v1's `ember-engines/test-support`.
 */
export function setupEngine(hooks, engineName) {
  hooks.beforeEach(async function () {
    if (this.engine !== undefined) {
      throw new Error(
        'You cannot use `setupEngine` twice for the same test setup. If you need to set up multiple engines, use `loadEngine` directly.',
      );
    }

    this.engine = await loadEngine(engineName);
  });
}

/**
 * Builds and boots an instance of the named engine from the test's owner, the
 * way the router does when it mounts the engine: routable, with the engine's
 * name as its mount point. A lazy engine's bundle is loaded first.
 */
export async function loadEngine(engineName) {
  let { owner } = getContext();

  // Before any registry lookup: the registry remembers a miss, so asking for a
  // lazy engine before its bundle is loaded would hide it for good.
  await loadBundle(owner, engineName);

  let engine = owner.buildChildEngineInstance(engineName, {
    routable: true,
    mountPoint: engineName,
  });
  // Destroyed before the test's owner, as the router does with engines it
  // mounts.
  associateDestroyableChild(owner, engine);
  await engine.boot();

  return engine;
}

// What @embroider/router does when a lazy engine's route is first entered.
// Eager engines have no bundle and are already registered.
async function loadBundle(owner, engineName) {
  let bundle = globalThis._embroiderEngineBundles_?.find((b) =>
    b.names.includes(engineName),
  );
  if (!bundle) return;

  let { default: modules } = await bundle.load();
  owner.lookup('resolver:current').addModules(modules);
}
