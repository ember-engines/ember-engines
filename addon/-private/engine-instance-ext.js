import { camelize } from '@ember/string';
import { assert } from '@ember/debug';
import EngineInstance from '@ember/engine/instance';

EngineInstance.reopen({
  /**
    The root DOM element of the `EngineInstance` as an element or a
    [jQuery-compatible selector
    string](http://api.jquery.com/category/selectors/).

    @private
    @property {String|DOMElement} rootElement
  */
  rootElement: null,

  /**
    A mapping of dependency names and values, grouped by category.

    `dependencies` should be set by the parent of this engine instance upon
    instantiation and prior to boot.

    During the boot process, engine instances verify that their required
    dependencies, as defined on the parent `Engine` class, have been assigned
    by the parent.

    @private
    @property {Object} dependencies
  */
  dependencies: null,

  /**
    A cache of dependency names and values, grouped by engine name.

    This cache is maintained by `buildChildEngineInstance()` for every engine
    that's a child of this parent instance.

    Only dependencies that are singletons are currently allowed, which makes
    this safe.

    @private
    @property {Object} _dependenciesForChildEngines
  */
  _dependenciesForChildEngines: null,

  buildChildEngineInstance(name, options = {}) {
    // Check dependencies cached by engine name
    let dependencies =
      this._dependenciesForChildEngines &&
      this._dependenciesForChildEngines[name];

    // Prepare dependencies if none are cached
    if (!dependencies) {
      dependencies = {};

      let camelizedName = camelize(name);

      let engineConfiguration =
        this.base.engines && this.base.engines[camelizedName];

      if (engineConfiguration) {
        let engineDependencies = engineConfiguration.dependencies;

        if (engineDependencies) {
          ['services'].forEach(category => {
            if (engineDependencies[category]) {
              dependencies[category] = {};
              let dependencyType = this._dependencyTypeFromCategory(category);

              for (let i = 0; i < engineDependencies[category].length; i++) {
                let engineDependency = engineDependencies[category][i];
                let dependencyName;
                let dependencyNameInParent;

                if (typeof engineDependency === 'object') {
                  dependencyName = Object.keys(engineDependency)[0];
                  dependencyNameInParent = engineDependency[dependencyName];
                } else {
                  dependencyName = dependencyNameInParent = engineDependency;
                }

                let dependencyKey = `${dependencyType}:${dependencyNameInParent}`;
                let dependency = this.lookup(dependencyKey);

                assert(
                  `Engine parent failed to lookup '${dependencyKey}' dependency, as declared in 'engines.${camelizedName}.dependencies.${category}'.`,
                  dependency
                );

                dependencies[category][dependencyName] = dependency;
              }
            }
          });

          if (engineDependencies.externalRoutes) {
            dependencies.externalRoutes = engineDependencies.externalRoutes;
          }
        }
      }

      // Cache dependencies for child engines for faster instantiation in the future
      this._dependenciesForChildEngines =
        this._dependenciesForChildEngines || {};
      this._dependenciesForChildEngines[name] = dependencies;
    }

    options.dependencies = dependencies;

    return this._super(name, options);
  },

  /*
    Gets the application-scoped route path for an external route.

    @private
    @method _getExternalRoute
    @param {String} routeName
    @return {String} route
  */
  _getExternalRoute(routeName) {
    const route = this._externalRoutes[routeName];

    assert(`The external route ${routeName} does not exist`, route);

    return route;
  },

  cloneParentDependencies() {
    this._super();

    let requiredDependencies = this.base.dependencies;

    if (requiredDependencies) {
      Object.keys(requiredDependencies).forEach(category => {
        let dependencyType = this._dependencyTypeFromCategory(category);

        if (category === 'externalRoutes') {
          this._externalRoutes = {};
        }

        requiredDependencies[category].forEach(dependencyName => {
          let dependency =
            this.dependencies[category] &&
            this.dependencies[category][dependencyName];

          assert(
            `A dependency mapping for '${category}.${dependencyName}' must be declared on this engine's parent.`,
            dependency
          );

          if (category === 'externalRoutes') {
            this._externalRoutes[dependencyName] = dependency;
          } else {
            let key = `${dependencyType}:${dependencyName}`;
            this.register(key, dependency, { instantiate: false });
          }
        });
      });
    }
  },

  _dependencyTypeFromCategory(category) {
    switch (category) {
      case 'services':
        return 'service';
      case 'externalRoutes':
        return 'externalRoute';
    }
    assert(
      `Dependencies of category '${category}' can not be shared with engines.`,
      false
    );
  },

  // mount(view) {
  //   assert('EngineInstance must be booted before it can be mounted', this._booted);
  //
  //   view.append()
  // },

  /**
    This hook is called by the root-most Route (a.k.a. the ApplicationRoute)
    when it has finished creating the root View. By default, we simply take the
    view and append it to the `rootElement` specified on the Application.

    In cases like FastBoot and testing, we can override this hook and implement
    custom behavior, such as serializing to a string and sending over an HTTP
    socket rather than appending to DOM.

    @param view {Ember.View} the root-most view
    @private
  */
  didCreateRootView(view) {
    view.appendTo(this.rootElement);
  },
});
