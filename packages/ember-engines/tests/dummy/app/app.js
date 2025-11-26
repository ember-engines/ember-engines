import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from 'dummy/config/environment';
import compatModules from '@embroider/virtual/compat-modules';

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver.withModules(compatModules);

  engines = {
    'ember-blog': {
      dependencies: {
        services: [{ 'data-store': 'store' }],
        externalRoutes: {
          home: 'application',
        },
      },
    },
    'ember-chat': {
      dependencies: {
        services: ['store'],
      },
    },
  };
}

loadInitializers(App, config.modulePrefix, compatModules);
