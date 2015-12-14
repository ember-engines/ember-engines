import Ember from 'ember';

const {
  EngineInstance,
  assert,
  RSVP
} = Ember;

EngineInstance.reopen({
  parentInstance: null,

  /**
    The root DOM element of the `EngineInstance` as an element or a
    [jQuery-compatible selector
    string](http://api.jquery.com/category/selectors/).

    @private
    @property {String|DOMElement} rootElement
  */
  rootElement: null,

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

    assert('`parent` is a required option for `EngineInstance#boot()`', options.parent);

    this.parent = options.parent;

    this._bootPromise = new RSVP.Promise(resolve => resolve(this._bootSync(options)));

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
  _bootSync(options) {
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

    this.cloneDependencies();

    this._booted = true;

    console.log('EngineInstance#booted');

    return this;
  },

  cloneDependencies() {
    let parent = this.parent;

    [
      'view:toplevel',
      'renderer:-dom',
      'route:basic',
      'event_dispatcher:main',
      'router:main',
      '-bucket-cache:main',
      'service:-routing'
    ].forEach((key) => {
      this.register(key, parent.resolveRegistration(key));
    });
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
