import Application from '@ember/application';
import compatModules from '@embroider/virtual/compat-modules';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
// v1 ember-engines is installed here too, the way an app looks mid-migration.
// Its initializer still patches EngineInstance; the v2 engines don't rely on
// it, because they extend ember-engines-runtime/engine, which also registers
// each engine's router service.
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
    shop: { dependencies: { services: ['session'] } },
    widget: { dependencies: { services: ['session'] } },
  };
}

loadInitializers(App, config.modulePrefix, compatModules);
