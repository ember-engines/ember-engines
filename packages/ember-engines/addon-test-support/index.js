/* global require */
import { getContext } from '@ember/test-helpers';

/**
 * Used to set up engine for use. Must be called after one of the `ember-qunit`
 * `setup*Test()` methods.
 *
 *   Responsible for:
 *     - create an engine object and set it on the provided context (e.g. `this.engine`)
 *
 * @method setupEngine
 * @param {NestedHooks} hooks
 * @param {String} engineName
 * @public
 */

export function setupEngine(hooks, engineName) {
  hooks.beforeEach(async function() {
    if (this.engine !== undefined) {
      throw new Error('You cannot use `setupEngine` twice for the same test setup. If you need to setup multiple engines, use `loadEngine` directly.');
    }

    // setup `this.engine`
    this.engine = await loadEngine(engineName);
  });
}

/**
 * Checks the owner to see if it has a registration for an Engine. This is a
 * proxy to tell if an Engine's assets are loaded or not.
 *
 * @see https://github.com/ember-engines/ember-engines/blob/8f66b5e3b8089cd53884be49f270cac05f9a3d17/addon/-private/router-ext.js#L152-L164
 *
 * @param {Owner} owner
 * @param {String} name
 * @return {Boolean}
 */
function ownerHasEngine(owner, engineName) {
  return owner.hasRegistration(`engine:${engineName}`);
}

/**
 * Registers an Engine that was recently loaded.
 *
 * @see https://github.com/ember-engines/ember-engines/blob/8f66b5e3b8089cd53884be49f270cac05f9a3d17/addon/-private/router-ext.js#L166-L182
 *
 * @param {Owner} owner
 * @param {String} name
 */
function registerEngine(owner, engineName) {
  // ownerHasEngine does registry lookup and caches "miss".
  // With register() we tell registry that module is now available.
  owner.register(`engine:${engineName}`, require(`${engineName}/engine`).default);
}

async function buildEngineOwner(owner, engineName) {
  let engineInstance;

  if (ownerHasEngine(owner, engineName)) {
    // eager engines
    engineInstance = owner.buildChildEngineInstance(engineName, {
      routable: true,
      mountPoint: engineName,
    });

    await engineInstance.boot();
  } else {
    // lazy engines
    engineInstance = await loadEngine(engineName);
  }

  return engineInstance;
}

export async function loadEngine(engineName) {
  let { owner } = getContext();
  if (!ownerHasEngine(owner, engineName)) {
    // ensure that the assets are fully loaded
    let assetLoader = owner.lookup('service:asset-loader');

    await assetLoader.loadBundle(engineName);

    registerEngine(owner, engineName);
  }

  return buildEngineOwner(owner, engineName);
}
