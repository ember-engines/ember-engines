import Ember from 'ember';

const hasDefaultSerialize = Ember.__loader.require('ember-routing/system/route').hasDefaultSerialize;

const {
  Logger: {
    info
  },
  Router,
  RSVP,
  assert,
  get,
  getOwner
} = Ember;

Router.reopen({
  assetLoader: Ember.inject.service(),

  /**
   * We skip doing default query params stuff when attempting to go to an
   * Engine route.
   *
   * @override
   */
  _prepareQueryParams(routeName) {
    if (this._engineInfoByRoute[routeName]) {
      return;
    }

    return this._super(...arguments);
  },

  /**
   * We override this to fetch assets when crossing into a lazy Engine for the
   * first time. For other cases we do the normal thing.
   *
   * @override
   */
  _getHandlerFunction() {
    let seen = Object.create(null);
    let owner = getOwner(this);

    return (name) => {
      let engineInfo = this._engineInfoByRoute[name];

      if (engineInfo) {
        return this._getEngineInstance(engineInfo).then((instance) => {
          let handler = this._internalGetHandler(seen, name, engineInfo.localFullName, instance);

          if (!hasDefaultSerialize(handler)) {
            throw new Error('Defining a custom serialize method on an Engine route is not supported.');
          }

          return handler;
        });
      }

      // If we don't cross into an Engine, then the routeName and localRouteName
      // are the same.
      return this._internalGetHandler(seen, name, name, owner);
    };
  },

  /**
   * This method is responsible for actually doing the lookup in getHandler.
   * It is separate so that it can be used from different code paths.
   *
   * @private
   * @method _internalGetHandler
   * @param {Object} seen
   * @param {String} routeName
   * @param {String} localRouteName
   * @param {Owner} routeOwner
   * @return {Route} handler
   */
  _internalGetHandler(seen, routeName, localRouteName, routeOwner) {
    const fullRouteName = 'route:' + localRouteName;
    let handler = routeOwner.lookup(fullRouteName);

    if (seen[routeName] && handler) {
      return handler;
    }

    seen[routeName] = true;

    if (!handler) {
      const DefaultRoute = routeOwner._lookupFactory('route:basic');

      routeOwner.register(fullRouteName, DefaultRoute.extend());
      handler = routeOwner.lookup(fullRouteName);

      if (get(this, 'namespace.LOG_ACTIVE_GENERATION')) {
        info(`generated -> ${fullRouteName}`, { fullName: fullRouteName });
      }
    }

    handler.routeName = localRouteName;

    return handler;
  },

  /**
   * Checks the owner to see if it has a registration for an Engine. This is a
   * proxy to tell if an Engine class is loaded or not.
   *
   * @private
   * @method _engineIsLoaded
   * @param {String} name
   * @return {Boolean}
   */
  _engineIsLoaded(name) {
    let owner = getOwner(this);
    return owner.hasRegistration('engine:' + name);
  },

  /**
   * Registers an Engine that was recently loaded.
   *
   * @private
   * @method _registerEngine
   * @param {String} name
   * @return {Void}
   */
  _registerEngine(name) {
    let owner = getOwner(this);
    if (!owner.hasRegistration('engine:' + name)) {
      owner.register('engine:' + name, window.require(name + '/engine').default);
    }
  },

  /**
   * Returns a Promise that resolves with an EngineInstance for a specific type
   * of Engine. It fetches the Engine assets if necessary.
   *
   * @private
   * @method _getEngineInstance
   * @param {Object} engineInfo
   * @param {String} engineInfo.name
   * @param {String} engineInfo.instanceId
   * @param {String} engineInfo.mountPoint
   * @return {Promise}
   */
  _getEngineInstance({ name, instanceId, mountPoint }) {
    let engineInstances = this._engineInstances;

    if (!engineInstances[name]) {
      engineInstances[name] = Object.create(null);
    }

    let engineInstance = engineInstances[name][instanceId];

    // Engine instance has already been created
    if (engineInstance) {
      return RSVP.resolve(engineInstance);
    }

    // Engine has been loaded but instance not created
    if (this._engineIsLoaded(name)) {
      engineInstance = this._constructEngineInstance(name, mountPoint);
      engineInstances[name][instanceId] = engineInstance;

      return RSVP.resolve(engineInstance);
    }

    // Engine has not been loaded
    return engineInstances[name][instanceId] = this.get('assetLoader')
      .loadBundle(name)
      .then(() => {
        this._registerEngine(name);
        return engineInstances[name][instanceId] = this._constructEngineInstance(name, mountPoint);
      });
  },

  /**
   * Constructs an instance of an Engine at the specified mountPoint.
   * TODO: Figure out if this works with nested Engines.
   *
   * @private
   * @method _constructEngineInstance
   * @param {String} name
   * @param {String} mountPoint
   * @return {EngineInstance} engineInstance
   */
  _constructEngineInstance(name, mountPoint) {
    const owner = getOwner(this);

    assert(
      'You attempted to mount the engine \'' + name + '\' in your router map, but the engine can not be found.',
      owner.hasRegistration(`engine:${name}`)
    );

    const engineInstance = owner.buildChildEngineInstance(name, {
      routable: true,
      mountPoint
    });

    engineInstance.boot();

    return engineInstance;
  }
});
