import Ember from 'ember';

const {
  Error: EmberError,
  EngineInstance,
  assert,
  RSVP
} = Ember;

EngineInstance.reopen({
  parent: null,

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
    let dependencies = this._dependenciesForChildEngines && this._dependenciesForChildEngines[name];

    // Prepare dependencies if none are cached
    if (!dependencies) {
      dependencies = {};

      let camelizedName = Ember.String.camelize(name);

      let engineConfiguration = this.base.engines && this.base.engines[camelizedName];

      if (engineConfiguration) {
        let engineDependencies = engineConfiguration.dependencies;

        if (engineDependencies) {
          ['services'].forEach((category) => {
            if (engineDependencies[category]) {
              dependencies[category] = {};
              let dependencyType = this._dependencyTypeFromCategory(category);

              for (let engineDependency of engineDependencies[category]) {
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

                assert(`Engine parent failed to lookup '${dependencyKey}' dependency, as declared in 'engines.${camelizedName}.dependencies.${category}'.`, dependency);

                dependencies[category][dependencyName] = dependency;
              }
            }
          });
        }
      }

      // Cache dependencies for child engines for faster instantiation in the future
      this._dependenciesForChildEngines = this._dependenciesForChildEngines || {};
      this._dependenciesForChildEngines[name] = dependencies;
    }

    let Engine = this.lookup(`engine:${name}`);

    if (!Engine) {
      throw new EmberError(`You attempted to mount the engine '${name}', but it can not be found.`);
    }

    options.parent = this;

    options.dependencies = dependencies;

    let engineInstance = Engine.buildInstance(options);

    return engineInstance;
  },

  /**
    Initialize the `Ember.EngineInstance` and return a promise that resolves
    with the instance itself when the boot process is complete.

    The primary task here is to run any registered instance initializers.

    See the documentation on `BootOptions` for the options it takes.

    @private
    @method boot
    @param options
    @return {Promise<Ember.EngineInstance,Error>}
  */
  boot(options = {}) {
    console.log('EngineInstance#boot');

    if (this._bootPromise) { return this._bootPromise; }

    assert('`parent` is a required to be set prior to calling `EngineInstance#boot` ', this.parent);

    this._bootPromise = new RSVP.Promise(resolve => resolve(this._bootSync(options)));

    // TODO: Unsure that we should allow boot to be async...

    return this._bootPromise;
  },

  /**
    Unfortunately, a lot of existing code assumes booting an instance is
    synchronous – specifically, a lot of tests assumes the last call to
    `app.advanceReadiness()` or `app.reset()` will result in a new instance
    being fully-booted when the current runloop completes.

    We would like new code (like the `visit` API) to stop making this assumption,
    so we created the asynchronous version above that returns a promise. But until
    we have migrated all the code, we would have to expose this method for use
    *internally* in places where we need to boot an instance synchronously.

    @private
  */
  _bootSync(/* options */) {
    if (this._booted) { return this; }

    // if (isEnabled('ember-application-visit')) {
    //   options = new BootOptions(options);
    //
    //   let registry = this.__registry__;
    //
      // registry.register('-environment:main', options.toEnvironment(), { instantiate: false });
      // registry.injection('view', '_environment', '-environment:main');
      // registry.injection('route', '_environment', '-environment:main');
      //
      // registry.register('renderer:-dom', {
      //   create() {
      //     return new Renderer(new DOMHelper(options.document), options.isInteractive);
      //   }
      // });
      //
      // if (options.rootElement) {
      //   this.rootElement = options.rootElement;
      // } else {
      //   this.rootElement = this.application.rootElement;
      // }
      //
      // if (options.location) {
      //   let router = get(this, 'router');
      //   set(router, 'location', options.location);
      // }
      //
      // this.base.runInstanceInitializers(this);
      //
      // if (options.isInteractive) {
      //   this.setupEventDispatcher();
      // }
    // } else {
      this.base.runInstanceInitializers(this);

      // if (environment.hasDOM) {
      //   this.setupEventDispatcher();
      // }
    // }

    this.cloneCoreDependencies();

    this.cloneCustomDependencies();

    this._booted = true;

    console.log('EngineInstance#booted');

    return this;
  },

  cloneCoreDependencies() {
    let parent = this.parent;

    [
      'view:toplevel',
      'route:basic',
      'event_dispatcher:main',
      '-bucket-cache:main',
      'service:-routing'
    ].forEach((key) => {
      this.register(key, parent.resolveRegistration(key));
    });

    [
      'renderer:-dom',
      'router:main',
      '-view-registry:main'
    ].forEach((key) => {
      this.register(key, parent.lookup(key), { instantiate: false });
    });
  },

  cloneCustomDependencies() {
    let requiredDependencies = this.base.dependencies;

    if (requiredDependencies) {
      Object.keys(requiredDependencies).forEach((category) => {
        let dependencyType = this._dependencyTypeFromCategory(category);

        requiredDependencies[category].forEach((dependencyName) => {
          let key = `${dependencyType}:${dependencyName}`;

          let dependency = this.dependencies[category] && this.dependencies[category][dependencyName];

          assert(`A dependency mapping for '${category}.${dependencyName}' must be declared on this engine's parent.`, dependency);

          this.register(key, dependency, { instantiate: false });

          console.log('clone custom dependency:', key);
        });
      });
    }
  },

  _dependencyTypeFromCategory(category) {
    switch(category) {
      case 'services':
        return 'service';
    }
    assert(`Dependencies of category '${category}' can not be shared with engines.`, false);
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
