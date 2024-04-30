import Component from '@glimmer/component';
import { next } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { inject as service } from '@ember/service';
import { isDestroyed, isDestroying } from '@ember/destroyable';
import {
  dependencySatisfies,
  importSync,
  macroCondition,
} from '@embroider/macros';

let waiter;

if (macroCondition(dependencySatisfies('@ember/test-waiters', '*'))) {
  const { buildWaiter } = importSync('@ember/test-waiters');
  waiter = buildWaiter('ember-engines:lazy-mount');
}

// interface LazyMountSignature {
//   Args: {
//     /** The name of the engine to load and subsequently mount. */
//     name: string;

//     /**
//      * Optional model that will be passed through to the engine.
//      *
//      * @see https://emberjs.com/api/ember/3.7/classes/Ember.Templates.helpers/methods/mount?anchor=mount
//      */
//     model?: unknown;

//     /** Optional callback called when the engine starts loading. */
//     onLoad?: () => void;

//     /** Optional callback called when the engine finished loading. */
//     didLoad?: () => void;

//     /** Optional callback called when the engine failed to load. */
//     onError?: (error: Error) => void;
//   };
//   Blocks: {
//     loading: [];
//     error: [Error];
//   };
// }

/**
 * The `<LazyMount>` component works similar to the
 * [`{{mount}}` helper](https://emberjs.com/api/ember/3.5/classes/Ember.Templates.helpers/methods/mount?anchor=mount).
 *
 * It accepts the name of the engine as a positional parameter and also an
 * optional `@model` parameter.
 *
 * As soon as the helper is rendered, it will begin loading the specified
 * engine. If the engine is already loaded, it will be mounted immediately.
 *
 * The `@name` and `@model` parameters are dynamic and you can update them.
 * Setting a new `engineName` will cause the new engine to be loaded and mounted.
 *
 * #### Inline Usage
 *
 * While the engine is loading, nothing is rendered. If there was an error
 * loading the engine, nothing is rendered.
 *
 * ```hbs
 * <LazyMount @name={{engineName}} @model={{optionalDataForTheEngine}}/>
 * ```
 *
 * #### Block Usage
 *
 * While the engine is loading or if there was an error loading the engine, the
 * block that is passed to the component is rendered. The `engine` has two named
 * blocks:
 *
 * ```hbs
 * <LazyMount @name={{engineName}} @model={{optionalDataForTheEngine}}>
 *   <:loading>
 *     🕑 The engine is loading...
 *   </:loading>
 *
 *   <:error as |err|>
 *     😨 There was an error loading the engine:
 *     <code>{{err}}</code>
 *   </:error>
 * </LazyMount>
 * ```
 *
 * When the engine was loaded successfully, the passed in block is replaced by
 * the engine.
 *
 * @class LazyMount
 * @param {string} name Name of the engine to mount.
 * @param {any} [model] Object that will be set as
 *                      the model of the engine.
 * @public
 */
export default class LazyMount extends Component {
  @service engineLoader;

  /**
   * When the engine was loaded successfully, this will then be the name of the
   * engine. Presence of this field therefore indicates that the engine was
   * loaded successfully.
   *
   * This field is also used by `didReceiveAttrs` for diffing.
   *
   * @property loadedName
   * @type {string?}
   * @private
   */
  @tracked loadedName;

  /**
   * If an error occurred while loading the engine, it will be set here.
   *
   * @property error
   * @type {Error?}
   * @private
   */
  @tracked error;

  /**
   * While the bundle is being loaded, this property is `true`.
   *
   * @property isLoading
   * @type {boolean}
   * @private
   */
  @tracked isLoading = false;

  load = (name) => {
    assert(`lazy-mount: Argument 'name' is missing.`, name);

    if (name !== this.loadedName) {
      // only load a new engine, if it is different from the last one
      this.loadEngine(name);
    }
  };

  /**
   * Manages the life cycle of loading an engine bundle and setting the
   * following properties in accordance:
   *
   * - `isLoading`
   * - `error`
   * - `loadedName`
   */
  async loadEngine(name = this.name) {
    const shouldCancel = this._thread();

    this.setLoading();

    if (!this.engineLoader.isLoaded(name)) {
      try {
        await this.engineLoader.load(name);
        if (shouldCancel()) return;
      } catch (error) {
        if (shouldCancel()) return;
        await this.setError(error);
        return;
      }
    }

    await this.setLoaded(name);
  }

  async setLoading() {
    this.args.onLoad?.();

    return new Promise((resolve) => {
      next(() => {
        this.loadedName = undefined;
        this.error = undefined;
        this.isLoading = true;
        resolve();
      });
    });
  }

  async setLoaded(loadedName) {
    this.args.didLoad?.();

    return new Promise((resolve) => {
      next(() => {
        this.loadedName = loadedName;
        this.error = undefined;
        this.isLoading = false;
        resolve();
      });
    });
  }

  async setError(error) {
    this.args.onError?.(error);

    return new Promise((resolve) => {
      next(() => {
        this.loadedName = undefined;
        this.error = error;
        this.isLoading = false;
        resolve();
      });
    });
  }

  /**
   * The following is a really low-fidelity implementation of something that
   * would be handled by ember-concurrency or ember-tasks
   */

  threadId;

  _thread() {
    let token;
    if (waiter) {
      token = waiter.beginAsync();
    }

    const threadId = (this._threadId = {});
    return () => {
      if (waiter) {
        waiter.endAsync(token);
      }

      return (
        isDestroyed(this) || isDestroying(this) || this._threadId !== threadId
      );
    };
  }
}
