import Ember from 'ember';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

const App = Ember.Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver,

  engines: {
    emberBlog: {
      dependencies: {
        services: [{ 'data-store': 'store' }],
        externalRoutes: {
          home: 'application',
        },
      },
    },
    emberChat: {
      dependencies: {
        services: ['store'],
      },
    },
  },
});

loadInitializers(App, config.modulePrefix);

export default App;
