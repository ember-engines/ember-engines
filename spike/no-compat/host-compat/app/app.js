import Application from '@ember/application';
import compatModules from '@embroider/virtual/compat-modules';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
// No v1 ember-engines here, so the runtime's extension is imported directly.
// router-service's own initializer still runs through compat's app-js.
import 'ember-engines-runtime/engine-instance-ext';
import config from './config/environment.js';

// Compat generates the engine bundles, route maps (implicit-modules) and
// ui-kit's app-js services, so none of the no-compat wiring is here.
export default class App extends Application {
  modulePrefix = config.modulePrefix;
  Resolver = Resolver.withModules(compatModules);

  engines = {
    blog: {
      dependencies: {
        services: ['session'],
        externalRoutes: { home: 'account', item: 'item', other: 'blog-two' },
      },
    },
    comments: {
      dependencies: { services: ['session'], externalRoutes: { home: 'index' } },
    },
  };
}

loadInitializers(App, config.modulePrefix, compatModules);
