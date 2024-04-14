// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
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

/**
 * The `{{lazy-mount}}` component works just like the
 * [`{{mount}}` helper](https://api.emberjs.com/ember/release/classes/Ember.Templates.helpers/methods/mount?anchor=mount).
 *
 * It accepts the name of the engine as a positional parameter and also an
 * optional `model` parameter.
 *
 * As soon as the helper is rendered, it will begin loading the specified
 * engine. If the engine is already loaded, it will be mounted immediately.
 *
 * The `engineName` and `model` parameters are dynamic and you can update them.
 * Setting a new `engineName` will cause the new engine to be loaded and mounted.
 *
 * #### Inline Usage
 *
 * While the engine is loading, nothing is rendered. If there was an error
 * loading the engine, nothing is rendered.
 *
 * ```hbs
 * {{lazy-mount engineName model=optionalDataForTheEngine}}
 * ```
 *
 * #### Block Usage
 *
 * While the engine is loading or if there was an error loading the engine, the
 * block that is passed to the component is rendered. The `engine` block
 * parameter is an object with two properties:
 *
 * - **`isLoading`**: _`boolean`_ — Whether or not the engine is currently
 *   loading
 * - **`error`**: _`Error | null`_ — If there was an error loading the engine
 *
 * When the engine was loaded successfully, the passed in block is replaced by
 * the engine.
 *
 * ```hbs
 * {{#lazy-mount engineName model=optionalDataForTheEngine as |engine|}}
 *   {{#if engine.isLoading}}
 *     🕑 The engine is loading...
 *   {{else if engine.error}}
 *     😨 There was an error loading the engine:
 *     <code>{{engine.error}}</code>
 *   {{/if}}
 * {{/lazy-mount}}
 * ```
 *
 * @class LazyMountComponent
 * @param {string} name Name of the engine to mount.
 * @param {any} [model] Object that will be set as
 *                      the model of the engine.
 * @public
 */
export default class LazyMount extends Component {
  tagName = '';
  @service engineLoader;

  /**
   * The name of the engine to load and subsequently mount.
   *
   * @property name
   * @type {string}
   * @public
   */
  name = null;

  /**
   * Optional model that will be passed through to the engine.
   *
   * @see https://emberjs.com/api/ember/3.7/classes/Ember.Templates.helpers/methods/mount?anchor=mount
   *
   * @property model
   * @type {any?}
   * @public
   */
  model = null;

  /**
   * Optional callback called when the engine starts loading.
   *
   * @property onLoad
   * @type {(() => void)?}
   * @public
   */
  onLoad = null;

  /**
   * Optional callback called when the engine finished loading.
   *
   * @property didLoad
   * @type {(() => void)?}
   * @public
   */
  didLoad = null;

  /**
   * Optional callback called when the engine filed to load.
   *
   * @property onLoad
   * @type {((error: Error) => void)?}
   * @public
   */
  onError = null;

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
  @tracked loadedName = null;

  /**
   * If an error occurred while loading the engine, it will be set here.
   *
   * @property error
   * @type {Error?}
   * @private
   */
  @tracked error = null;

  /**
   * While the bundle is being loaded, this property is `true`.
   *
   * @property isLoading
   * @type {boolean}
   * @private
   */
  @tracked isLoading = false;

  // eslint-disable-next-line ember/no-component-lifecycle-hooks
  didReceiveAttrs() {
    super.didReceiveAttrs(...arguments);

    const name = this.name;
    assert(`lazy-mount: Argument 'name' is missing.`, name);

    if (name !== this.loadedName) {
      // only load a new engine, if it is different from the last one
      this.loadEngine(name);
    }
  }

  /**
   * Manages the life cycle of loading an engine bundle and setting the
   * following properties in accordance:
   *
   * - `isLoading`
   * - `error`
   * - `loadedName`
   *
   * Called by `didReceiveAttrs`.
   *
   * @method loadEngine
   * @param {string} name
   * @async
   * @private
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
        this.setError(error);
        return;
      }
    }

    this.setLoaded(name);
  }

  setLoading() {
    this.onLoad && this.onLoad();

    this.loadedName = null;
    this.error = null;
    this.isLoading = true;
  }

  setLoaded(loadedName) {
    this.didLoad && this.didLoad();

    this.loadedName = loadedName;
    this.error = null;
    this.isLoading = false;
  }

  setError(error) {
    this.onError && this.onError(error);

    this.loadedName = null;
    this.error = error;
    this.isLoading = false;
  }

  /**
   * The following is a really low-fidelity implementation of something that
   * would be handled by ember-concurrency or ember-lifeline.
   */

  _threadId = null;

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

LazyMount.reopenClass({
  positionalParams: ['name'],
});
