import Service from '@ember/service';
import {
  dependencySatisfies,
  importSync,
  macroCondition,
} from '@embroider/macros';

const { getOwner } = (
  macroCondition(dependencySatisfies('ember-source', '>=4.10'))
    ? importSync('@ember/owner')
    : importSync('@ember/application')
)

export default class EngineLoader extends Service {
  /**
   * Checks the owner to see if it has a registration for an Engine. This is a
   * proxy to tell if an Engine's assets are loaded or not.
   *
   * @see https://github.com/ember-engines/ember-engines/blob/8f66b5e3b8089cd53884be49f270cac05f9a3d17/addon/-private/router-ext.js#L152-L164
   *
   * @param {String} name
   * @return {Boolean}
   */
  isLoaded(name) {
    const owner = getOwner(this);
    return owner.hasRegistration(`engine:${name}`);
  }

  /**
   * Registers an Engine that was recently loaded.
   *
   * @see https://github.com/ember-engines/ember-engines/blob/8f66b5e3b8089cd53884be49f270cac05f9a3d17/addon/-private/router-ext.js#L166-L182
   *
   * @param {String} name
   */
  async register(name) {
    if (this.isLoaded(name)) return;

    let module, engine;

    // now here it gets a little tricky. The dynamic `import()` is ambivalent.
    //
    // 1) When webpack is used for the build system of the host app, it gets
    //    rewritten to `__webpack_require__()`
    //
    // 2) In the classic build... well, I don't know?
    //
    // On the other hand is the `AssetLoaderService` from `ember-asset-loader`
    // who can lazy load bundles, but that would end up in `requirejs` and
    // `__webpack_require__` is not in sync with `requirejs`.
    //
    // So the ambivalent `import()` will under a classic build find the asset in
    // the `requirejs` bundles but under a webpack build will throw an error
    // (`Cannot find module \`${name}/engine\``).
    //
    // So here is the solution:
    // 1. Try to use `import()` because it should be the go to API to use for
    //    dynamically importing modules
    // 2. When that fails, try to access `requirejs` directly.
    //
    try {
      module = await import(`${name}/engine`);

      engine = module.default;
    } catch {
      if (!engine && requirejs !== undefined) {
        module = requirejs(`${name}/engine`);

        engine = module.default;
      }
    }

    if (engine) {
      getOwner(this).register(`engine:${name}`, engine);
    }
  }

  /**
   * Loads and registers a lazy Engine.
   *
   * @param {String} name
   * @async
   */
  async load(name) {
    if (this.isLoaded(name)) return;

    const assetLoader = getOwner(this).lookup('service:asset-loader');
    await assetLoader.loadBundle(name);
    this.register(name);
  }
}
