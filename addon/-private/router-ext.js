import Ember from 'ember';
import emberRequire from './ext-require';

const {
  assert,
  Router: EmberRouter,
  RouterDSL: EmberRouterDSL,
  getOwner,
  get
} = Ember;

const info = emberRequire('ember-metal/debug', 'info');
const EmptyObject = emberRequire('ember-metal/empty_object');

EmberRouter.reopen({
  init() {
    this._super(...arguments);

    this._engineInstances = new EmptyObject();
    this._routeToEngineInfoXRef = new EmptyObject();
    this._urls = [];
  },

  /*
    Overridden to allow passing an additional option of `resolveRouteMap`
    which is used in the DSL's `mount` method to find a given engines route map.
  */
  _buildDSL() {
    let owner = getOwner(this);
    let moduleBasedResolver = this._hasModuleBasedResolver();
    let router = this;

    return new EmberRouterDSL(null, {
      enableLoadingSubstates: !!moduleBasedResolver,

      resolveRouteMap(name) {
        return owner._lookupFactory('route-map:' + name);
      },

      addRouteForEngine(name, engineInfo) {
        router._routeToEngineInfoXRef[name] = engineInfo;
      },

      addUrl(url) {
        router._urls.push(url);
      }
    });
  },

  _getEngineInstance({ name, instanceId, mountPoint }) {
    let engineInstances = this._engineInstances;

    if (!engineInstances[name]) {
      engineInstances[name] = new EmptyObject();
    }

    let engineInstance = engineInstances[name][instanceId];

    if (!engineInstance) {
      let owner = getOwner(this);

      assert(
        'You attempted to mount the engine \'' + name + '\' in your router map, but the engine can not be found.',
        owner.hasRegistration(`engine:${name}`)
      );

      engineInstance = owner.buildChildEngineInstance(name, {
        routable: true,
        mountPoint
      });

      engineInstance.boot();

      engineInstances[name][instanceId] = engineInstance;
    }

    return engineInstance;
  },


  /*
    Overridden to use the passed in `info` object as an object (previously a string
    representing the route name).
  */
  _getHandlerFunction() {
    var seen = new EmptyObject();
    let owner = getOwner(this);

    return (_name) => {
      let name = _name;
      let engineInfo = this._routeToEngineInfoXRef[name];
      let handler, engineInstance, routeOwner;

      if (engineInfo) {
        engineInstance = this._getEngineInstance(engineInfo);

        routeOwner = engineInstance;
        name = engineInfo.localFullName;
      } else {
        routeOwner = owner;
      }

      let routeName = 'route:' + name;

      handler = routeOwner.lookup(routeName);

      if (seen[_name]) {
        return handler;
      }

      seen[_name] = true;

      if (!handler) {
        let DefaultRoute = routeOwner._lookupFactory('route:basic');

        routeOwner.register(routeName, DefaultRoute.extend());
        handler = routeOwner.lookup(routeName);

        if (get(this, 'namespace.LOG_ACTIVE_GENERATION')) {
          info(`generated -> ${routeName}`, { fullName: routeName });
        }
      }

      handler.routeName = name;

      return handler;
    };
  },

  setupRouter: function() {
    let ret = this._super(...arguments);

    let owner = getOwner(this);
    let urls = this._urls;
    urls.forEach(url => {
        owner.register(`url:${url}`, Ember.Object.extend({url: url}));
    });


    return ret;
  }
});
