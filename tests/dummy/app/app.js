import Ember from 'ember';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

Ember.MODEL_FACTORY_INJECTIONS = true;

const { modulePrefix } = config;

const App = Ember.Application.extend({
  modulePrefix,
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
