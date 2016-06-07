import Ember from 'ember';
import Resolver from 'ember-engines/resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

Ember.MODEL_FACTORY_INJECTIONS = true;

const { modulePrefix, podModulePrefix } = config;

const App = Ember.Application.extend({
  modulePrefix,
  podModulePrefix,
  Resolver,

  engines: {
    emberBlog: {
      dependencies: {
        services: [
          {'data-store': 'store'}
        ],
        externalRoutes: {
          home: 'application'
        }
      }
    },
    emberChat: {
      dependencies: {
        services: [
          'store'
        ]
      }
    }
  }
});

loadInitializers(App, modulePrefix);

export default App;
